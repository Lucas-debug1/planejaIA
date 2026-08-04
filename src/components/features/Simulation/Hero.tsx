import { PiggyBank } from 'lucide-react'

export function SimulationHero() {
  return (
    <div className="mb-8 text-center">
      <div className="flex flex-col items-center sm:flex-row sm:justify-center">
        <h1 className="text-foreground text-3xl font-semibold sm:text-4xl">
          Vamos planejar seu futuro
        </h1>
        <div className="bg-primary/10 mt-2 flex h-14 w-14 items-center justify-center rounded-full sm:mt-0 sm:ml-3">
          <PiggyBank size={28} className="text-primary" aria-hidden="true" />
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        Responda algumas questões para ter insights financeiros
        personalizados.
      </p>
    </div>
  )
}
