export function formatCurrencyMask(value: string): string {
  const digits = value.replace(/\D/g, '')

  if (!digits) {
    return ''
  }

  const number = parseInt(digits, 10) / 100

  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function parseCurrency(value: string): number {
  return (
    parseFloat(
      value.replace(/\./g, '').replace(',', '.').replace('R$', ''),
    ) || 0
  )
}

export function formatCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
