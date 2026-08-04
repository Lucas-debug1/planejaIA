import { useState } from 'react'

import { buildFollowUpPrompt } from '@/data/aiPrompt'
import {
  type ConversationMessage,
  useSimulationStorage,
} from '@/hooks/useSimulationStorage'
import { askFollowUpQuestion } from '@/services/aiService'

export function useConversation(id: string) {
  const { getFormData, saveConversation } = useSimulationStorage()

  const [messages, setMessages] = useState<ConversationMessage[]>(() => {
    return getFormData(id)?.conversation ?? []
  })
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendQuestion = async (question: string) => {
    const simulation = getFormData(id)

    if (!simulation || !question.trim()) {
      return
    }

    const userMessage: ConversationMessage = {
      role: 'user',
      content: question.trim(),
      timestamp: new Date().toISOString(),
    }

    const updatedWithUser = [...messages, userMessage]
    setMessages(updatedWithUser)
    saveConversation(id, updatedWithUser)

    setIsSending(true)
    setError(null)

    try {
      const prompt = buildFollowUpPrompt(simulation, messages, question)
      const answer = await askFollowUpQuestion(prompt)

      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: answer.trim(),
        timestamp: new Date().toISOString(),
      }

      const updatedWithAnswer = [...updatedWithUser, assistantMessage]
      setMessages(updatedWithAnswer)
      saveConversation(id, updatedWithAnswer)
    } catch {
      setError('Não foi possível obter uma resposta. Tente novamente.')
    } finally {
      setIsSending(false)
    }
  }

  return { messages, isSending, error, sendQuestion }
}
