export function euros(cent: number) {
  return `${(cent / 100).toFixed(2).replace('.', ',')} €`
}

export function fechaCorta(value: Date | string | null) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function fechaDia(value: Date | string | null) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(date)
}
