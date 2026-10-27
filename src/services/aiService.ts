interface ApiResponse {
  text?: string
  error?: string
}

async function callAI(prompt: string, asJson = false): Promise<string> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, json: asJson }),
  })

  const data = (await response.json().catch(() => ({}))) as ApiResponse

  if (!response.ok || !data.text) {
    throw new Error(data.error ?? `Erro na requisição: ${response.status}`)
  }

  return cleanText(data.text)
}

function cleanText(text: string): string {
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
  const json = await callAI(prompt, true)
  return JSON.parse(json) as InsightData
}

export async function askFollowUpQuestion(prompt: string): Promise<string> {
  return callAI(prompt)
}