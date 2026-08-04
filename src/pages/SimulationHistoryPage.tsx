import { CalendarClock, Goal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/shared/Button'
import { PageHero } from '@/components/shared/PageHero'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { formatCurrencyBRL } from '@/utils/currency'
import { calcMonthlySavings } from '@/utils/simulation'

export function SimulationHistoryPage() {
  const navigate = useNavigate()
  const { getAllSimulations, deleteSimulation } = useSimulationStorage()
  const [simulations, setSimulations] = useState(getAllSimulations())

  const handleDelete = (id: string) => {
    deleteSimulation(id)
    setSimulations(getAllSimulations())
  }

  if (simulations.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <PageHero
          title="Histórico de simulações"
          subtitle="Você ainda não fez nenhuma simulação."
        />
        <Button variant="primary" onClick={() => void navigate('/')}>
          Fazer minha primeira simulação
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <PageHero
        title="Histórico de simulações"
        subtitle="Reveja suas simulações anteriores e seus diagnósticos."
      />
      <div className="flex flex-col gap-4">
        {simulations.map((simulation) => {
          const monthlySavings = calcMonthlySavings(simulation)

          return (
            <div
              key={simulation.id}
              className="bg-card flex flex-col gap-4 rounded-2xl p-5 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Goal size={16} className="text-primary" />
                  <span className="text-foreground font-semibold">
                    {simulation.goalName}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Meta de {simulation.goalAmount} em {simulation.goalDeadline}{' '}
                  meses · Economia mensal necessária:{' '}
                  {formatCurrencyBRL(monthlySavings)}
                </p>
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                  <CalendarClock size={12} />
                  {new Date(simulation.createdAt).toLocaleDateString(
                    'pt-BR',
                    { day: '2-digit', month: '2-digit', year: 'numeric' },
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    void navigate(`/resultado/${simulation.id}`)
                  }
                >
                  Ver detalhes
                </Button>
                <Button
                  variant="ghost"
                  icon={Trash2}
                  aria-label="Excluir simulação"
                  onClick={() => handleDelete(simulation.id)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
