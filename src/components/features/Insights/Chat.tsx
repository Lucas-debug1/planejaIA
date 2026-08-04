import { Send } from 'lucide-react'
import { type SyntheticEvent, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/shared/Button'
import { Divider } from '@/components/shared/Divider'
import { useConversation } from '@/hooks/useConversation'

interface ChatProps {
  simulationId: string
}

export function Chat({ simulationId }: ChatProps) {
  const { messages, isSending, error, sendQuestion } =
    useConversation(simulationId)
  const [question, setQuestion] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!question.trim() || isSending) {
      return
    }

    const currentQuestion = question
    setQuestion('')
    void sendQuestion(currentQuestion)
  }

  return (
    <div className="mt-2">
      <Divider />
      <h3 className="text-foreground mb-3 text-sm font-semibold">
        💬 Converse com o educador financeiro
      </h3>

      {messages.length > 0 && (
        <div className="mb-4 flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-auto max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2 text-sm'
                  : 'bg-secondary-button text-foreground mr-auto max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-2 text-sm'
              }
            >
              {message.content}
            </div>
          ))}
          {isSending && (
            <div className="bg-secondary-button text-muted-foreground mr-auto max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-2 text-sm">
              Digitando...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {error && <p className="mb-2 text-sm text-red-500">⚠️ {error}</p>}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Pergunte algo sobre sua simulação..."
          className="bg-input text-foreground placeholder:text-muted-foreground flex-1 rounded-2xl px-4 py-3 text-sm outline-none shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)]"
        />
        <Button
          type="submit"
          variant="primary"
          className="rounded-2xl px-4 py-3"
          disabled={!question.trim() || isSending}
          aria-label="Enviar pergunta"
        >
          <Send size={16} />
        </Button>
      </form>
    </div>
  )
}
