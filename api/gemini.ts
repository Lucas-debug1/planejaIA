// Função serverless da Vercel: fica entre o navegador e a API do Gemini.
// A chave (GEMINI_API_KEY) existe só aqui no servidor, nunca vai para o navegador.

// Modelos tentados em ordem. Se o primeiro estiver sobrecarregado (503), cai para o próximo.
const MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest']

const RETRYABLE_STATUS = [429, 500, 502, 503, 504]
// Cada "rodada" tenta todos os modelos, um depois do outro, sem insistir no mesmo.
// Modelo sobrecarregado (503) dificilmente melhora em 1s, então já passa para o próximo.
const MAX_ROUNDS = 2
const ROUND_DELAY_MS = 1000
const GEMINI_TIMEOUT_MS = 25_000

const MAX_PROMPT_CHARS = 20_000

// Limite simples por IP (melhor esforço: a memória é por instância da função)
const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW_MS = 60_000
const hits = new Map<string, { count: number; resetAt: number }>()

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

function isRateLimited(ip: string) {
  const now = Date.now()
  const entry = hits.get(ip)

  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  entry.count += 1
  return entry.count > RATE_LIMIT_MAX
}

// Aceita só chamadas vindas do próprio site (e localhost em desenvolvimento)
function isAllowedOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return true // chamadas same-origin do navegador podem vir sem Origin

  const host = new URL(origin).hostname
  const requestHost = request.headers.get('host')?.split(':')[0]

  return host === requestHost || host === 'localhost' || host === '127.0.0.1'
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
}

class UpstreamError extends Error {
  status: number
  constructor(status: number) {
    super(`Gemini respondeu com status ${status}`)
    this.status = status
  }
}

async function callModel(model: string, apiKey: string, prompt: string, asJson: boolean) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        ...(asJson && { generationConfig: { responseMimeType: 'application/json' } }),
      }),
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    },
  )

  if (!response.ok) {
    throw new UpstreamError(response.status)
  }

  const data = (await response.json()) as GeminiResponse
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new UpstreamError(502)
  }

  return text
}

async function generate(apiKey: string, prompt: string, asJson: boolean) {
  let lastError: unknown

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    for (const model of MODELS) {
      try {
        return await callModel(model, apiKey, prompt, asJson)
      } catch (error) {
        lastError = error

        // Timeout (AbortSignal) também conta como falha temporária
        const retryable =
          !(error instanceof UpstreamError) || RETRYABLE_STATUS.includes(error.status)

        console.warn(`[gemini] ${model} falhou (rodada ${round}):`, String(error))

        if (!retryable) throw error
        // Falha temporária: segue direto para o próximo modelo, sem esperar
      }
    }

    if (round < MAX_ROUNDS) await sleep(ROUND_DELAY_MS)
  }

  throw lastError
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.error('[gemini] GEMINI_API_KEY não configurada')
    return json({ error: 'Serviço não configurado.' }, 500)
  }

  if (!isAllowedOrigin(request)) {
    return json({ error: 'Origem não permitida.' }, 403)
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return json({ error: 'Muitas requisições. Aguarde um minuto.' }, 429)
  }

  let body: { prompt?: unknown; json?: unknown }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Corpo da requisição inválido.' }, 400)
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''

  if (!prompt) {
    return json({ error: 'Prompt vazio.' }, 400)
  }

  if (prompt.length > MAX_PROMPT_CHARS) {
    return json({ error: 'Prompt muito longo.' }, 413)
  }

  try {
    const text = await generate(apiKey, prompt, body.json === true)
    return json({ text })
  } catch (error) {
    // O motivo real fica só nos logs do servidor; o navegador recebe mensagem genérica
    console.error('[gemini] falha definitiva:', String(error))
    const status = error instanceof UpstreamError && error.status === 429 ? 429 : 503
    return json({ error: 'A IA está indisponível no momento. Tente novamente.' }, status)
  }
}
