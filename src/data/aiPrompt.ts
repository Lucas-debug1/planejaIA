import type { ConversationMessage, SimulationRecord } from '@/hooks/useSimulationStorage'
import { parseCurrency } from '@/utils/currency'
import { calcMonthlySavings } from '@/utils/simulation'

const RESPONSE_SCHEMA = `{
  "feasibility": {
    "status": "viable" | "needs_adjustment" | "unfeasible",
    "content": "<Análise objetiva sobre se a meta é atingível no prazo com o valor disponível. Mencione os números relevantes.>"
  },
  "diagnosis": {
    "content": "<Diagnóstico focado no comprometimento do orçamento: quanto % da renda está comprometida com gastos e dívidas, e o que isso representa para a saúde financeira.>"
  },
  "suggestions": {
    "items": ["<Sugestão prática e concreta para reduzir gastos ou reorganizar o orçamento>"]
  },
  "extraIncome": {
    "items": ["<Ideia prática para gerar renda extra compatível com a realidade brasileira>"]
  },
  "investment": {
    "items": ["<Sugestão de investimento acessível para o perfil apresentado, com foco em atingir a meta>"]
  },
  "motivation": {
    "content": "<Mensagem final motivacional e personalizada, citando a meta pelo nome.>"
  }
}`

function buildSimulationContext(simulation: SimulationRecord) {
  const { income, expenses, debts, goalName, goalAmount, goalDeadline } =
    simulation

  const monthlySavings = calcMonthlySavings(simulation)
  const monthlySavingsNeeded =
    parseCurrency(goalAmount) / parseInt(goalDeadline, 10)

  return {
    income,
    expenses,
    debts,
    goalName,
    goalAmount,
    goalDeadline,
    monthlySavings,
    monthlySavingsNeeded,
  }
}

export function buildAIPrompt(simulation: SimulationRecord) {
  const {
    income,
    expenses,
    debts,
    goalName,
    goalAmount,
    goalDeadline,
    monthlySavings,
    monthlySavingsNeeded,
  } = buildSimulationContext(simulation)

  return `Você é um educador financeiro especializado em finanças pessoais. Analise os dados abaixo e gere um diagnóstico financeiro personalizado com linguagem clara, didática e encorajadora, voltado para pessoas sem conhecimento financeiro. O diagnóstico será exibido diretamente ao usuário no app, fale sempre em segunda pessoa ("você tem...", "sua meta...").

Dados da simulação:
- Renda mensal bruta: ${income}
- Custos fixos essenciais: ${expenses}
- Dívidas e parcelas mensais: ${debts}
- Valor disponível por mês: ${monthlySavings} reais
- Meta: ${goalName}
- Custo da meta: ${goalAmount}
- Prazo desejado: ${goalDeadline} meses
- Economia mensal necessária para atingir a meta no prazo: ${monthlySavingsNeeded} reais
- Saldo após reserva para a meta: ${monthlySavings - monthlySavingsNeeded} reais

Retorne APENAS um JSON válido, sem texto adicional, sem blocos de código, neste formato exato:

${RESPONSE_SCHEMA}

Regras:
- Todos os textos em português do Brasil
- Máximo de 4 itens por lista
- Seja específico ao citar valores calculados
- Não repita informações entre seções
- Nunca use markdown dentro dos valores do JSON
- Para o campo "feasibility.status", use os seguintes critérios:
  - "viable": saldo após reserva para a meta é maior ou igual a 0
  - "needs_adjustment": saldo negativo de até 20% do valor da economia mensal necessária
  - "unfeasible": saldo negativo superior a 20% do valor da economia mensal necessária`
}

/**
 * Desafio 2 — Conversando com o Educador Financeiro.
 * Monta um prompt de acompanhamento incluindo o contexto da simulação
 * e o histórico da conversa, para que a IA responda perguntas do usuário
 * mantendo coerência com o diagnóstico já gerado.
 */
export function buildFollowUpPrompt(
  simulation: SimulationRecord,
  history: ConversationMessage[],
  question: string,
) {
  const {
    income,
    expenses,
    debts,
    goalName,
    goalAmount,
    goalDeadline,
    monthlySavings,
  } = buildSimulationContext(simulation)

  const historyText = history
    .map((message) =>
      message.role === 'user'
        ? `Usuário: ${message.content}`
        : `Educador: ${message.content}`,
    )
    .join('\n')

  return `Você é o mesmo educador financeiro que já gerou um diagnóstico para este usuário. Continue a conversa respondendo à nova pergunta dele. Responda em português do Brasil, em segunda pessoa, de forma direta, curta (no máximo 3 parágrafos curtos) e didática. Não use markdown, não use JSON — responda em texto simples, pois o texto será exibido diretamente na tela do app.

Contexto da simulação financeira:
- Renda mensal bruta: ${income}
- Custos fixos essenciais: ${expenses}
- Dívidas e parcelas mensais: ${debts}
- Valor disponível por mês: ${monthlySavings} reais
- Meta: ${goalName} (${goalAmount} em ${goalDeadline} meses)

${historyText ? `Histórico da conversa até agora:\n${historyText}\n` : ''}
Nova pergunta do usuário: "${question}"

Responda apenas com a resposta do educador financeiro para essa pergunta, sem repetir a pergunta.`
}
