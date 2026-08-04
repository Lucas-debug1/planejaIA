import { useCallback, useEffect, useRef, useState } from 'react'

import { buildAIPrompt } from '@/data/aiPrompt'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { getInsight, type InsightData } from '@/services/aiService'

export const useInsight = (id: string) => {
  const { getFormData, saveInsight } = useSimulationStorage()
  const isRequestPending = useRef(false)

  const [insight, setInsight] = useState<InsightData | null>(() => {
    const simulation = getFormData(id)
    return simulation?.insight ?? null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // useCallback useEffect
  const fetchInsight = useCallback(
    async (simulationId: string) => {
      const simulation = getFormData(simulationId)

      if (!simulation) {
        setError('Simulação não encontrada.')
        return
      }

      isRequestPending.current = true
      setIsLoading(true)
      setError(null)

      try {
        const prompt = buildAIPrompt(simulation)
        const data = await getInsight(prompt)
        setInsight(data)
        saveInsight(simulationId, data)
        return data
      } catch (err) {
        console.error('Erro ao gerar insight:', err)
        setError('Erro ao gerar o diagnóstico. Tente novamente.')
      } finally {
        isRequestPending.current = false
        setIsLoading(false)
      }
    },
    [getFormData, saveInsight],
  )

  useEffect(() => {
    // Evita loop infinito e chamadas duplicadas
    if (insight || isLoading || isRequestPending.current || error) {
      return
    }

    fetchInsight(id).then((data) => {
      if (!data) {
        return
      }

      setInsight(data)
    })
  }, [id, insight, isLoading, error, fetchInsight])

  return { insight, isLoading, error, fetchInsight }
}
