// utils/couponHelpers.js

/**
 * Genera un código único de cupón a partir del id de oferta y un timestamp.
 * El backend puede reemplazar esto con su propia lógica de generación.
 */
export const generateCouponCode = (offerId) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const rand = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `DCF-${offerId?.toString().slice(0, 3).toUpperCase() || 'OFF'}-${rand}`
}

/**
 * Retorna el status visual de un cupón según su estado y fecha de vencimiento.
 * @param {'active'|'used'|'expired'} status
 * @param {string} expiresAt
 */
export const getCouponStatus = (status, expiresAt) => {
  if (status === 'used') return 'used'
  if (!expiresAt) return status
  const expired = new Date(expiresAt) < new Date()
  return expired ? 'expired' : 'active'
}

export const COUPON_STATUS_LABELS = {
  active:  'Activo',
  used:    'Usado',
  expired: 'Vencido',
}
