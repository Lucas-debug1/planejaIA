import { type SimulationFormData } from '@/data/simulation'
import type { InsightData } from '@/services/aiService'

const LOCAL_STORAGE_KEY = 'simulation-data'

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export type SimulationRecord = SimulationFormData & {
  id: string
  createdAt: string
  insight?: InsightData
  conversation?: ConversationMessage[]
}

function readAll(): SimulationRecord[] {
  const storage = localStorage.getItem(LOCAL_STORAGE_KEY)
  return storage ? (JSON.parse(storage) as SimulationRecord[]) : []
}

function writeAll(records: SimulationRecord[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records))
}

export const useSimulationStorage = () => {
  const saveFormData = (formData: SimulationFormData) => {
    const id = crypto.randomUUID()
    const record: SimulationRecord = {
      ...formData,
      id,
      createdAt: new Date().toISOString(),
    }

    writeAll([...readAll(), record])

    return id
  }

  const getFormData = (id: string): SimulationRecord | null => {
    return readAll().find((record) => record.id === id) || null
  }

  const getAllSimulations = (): SimulationRecord[] => {
    return [...readAll()].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }

  const deleteSimulation = (id: string) => {
    writeAll(readAll().filter((record) => record.id !== id))
  }

  const saveInsight = (id: string, insight: InsightData) => {
    writeAll(
      readAll().map((record) =>
        record.id === id ? { ...record, insight } : record,
      ),
    )
  }

  const saveConversation = (id: string, conversation: ConversationMessage[]) => {
    writeAll(
      readAll().map((record) =>
        record.id === id ? { ...record, conversation } : record,
      ),
    )
  }

  return {
    saveFormData,
    getFormData,
    getAllSimulations,
    deleteSimulation,
    saveInsight,
    saveConversation,
  }
}
