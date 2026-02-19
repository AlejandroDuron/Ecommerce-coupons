// utils/formatters.js

export const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(price)

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const daysUntil = (dateStr) => {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export const expiryLabel = (dateStr) => {
  const days = daysUntil(dateStr)
  if (days === null) return ''
  if (days < 0) return 'Vencido'
  if (days === 0) return '¡Vence hoy!'
  if (days === 1) return 'Vence mañana'
  if (days <= 3) return `Vence en ${days} días`
  return `Hasta ${formatDate(dateStr)}`
}
