interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[]
    }
  }[]
}

const API_KEY = String(import.meta.env.VITE_GEMINI_API_KEY ?? '')
const MODEL_NAME = 'gemini-flash-latest'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`

async function callGeminiAPI(prompt: string): Promise<GeminiResponse> {
  if (!API_KEY) {
    throw new Error(
      'Chave da API do Gemini não configurada. Adicione VITE_GEMINI_API_KEY no arquivo .env.local.',
    )
  }

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`)
  }

  return (await response.json()) as GeminiResponse
}

function extractText(response: GeminiResponse): string {
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('Resposta vazia retornada pela IA.')
  }

  // Remove eventuais blocos de código (```json ... ```) que a IA às vezes inclui
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()
}

export interface InsightData {
  feasibility: {
    status: 'viable' | 'needs_adjustment' | 'unfeasible'
    content: string
  }
  diagnosis: { content: string }
  suggestions: { items: string[] }
  extraIncome: { items: string[] }
  investment: { items: string[] }
  motivation: { content: string }
}

export async function getInsight(prompt: string): Promise<InsightData> {
  const response = await callGeminiAPI(prompt)
  const json = extractText(response)
  return JSON.parse(json) as InsightData
}

export async function askFollowUpQuestion(prompt: string): Promise<string> {
  const response = await callGeminiAPI(prompt)
  return extractText(response)
}
