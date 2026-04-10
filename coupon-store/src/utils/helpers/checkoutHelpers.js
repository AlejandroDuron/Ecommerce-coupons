import { supabase } from '../api/supabaseClient'
import { getOfferFinalPrice, getOfferMaxQuantity } from '../../context/cart/CartContext'

function normalizeOffer(offer) {
  return {
    id: offer.id,
    title: offer.titulo,
    company: offer.empresas?.nombre_empresa || 'Empresa',
    company_code: offer.empresas?.codigo_empresa || 'GEN',
    original_price: offer.precio_regular,
    final_price: offer.precio_oferta,
    cantidad_limite: offer.cantidad_limite,
    stock: offer.stock,
    available: offer.stock,
  }
}

export async function fetchLatestOffersForCheckout(items) {
  const offerIds = items.map((item) => item.offer.id)
  const { data, error } = await supabase
    .from('ofertas')
    .select(`
      id,
      titulo,
      precio_regular,
      precio_oferta,
      cantidad_limite,
      stock,
      empresas (
        codigo_empresa,
        nombre_empresa
      )
    `)
    .in('id', offerIds)

  if (error) throw error
  return data.map(normalizeOffer)
}

export function validateCheckoutItems(items, latestOffers) {
  return items.map((item) => {
    const latestOffer = latestOffers.find((offer) => offer.id === item.offer.id)
    if (!latestOffer) {
      throw new Error('Uno de los cupones ya no esta disponible.')
    }

    const maxQuantity = getOfferMaxQuantity(latestOffer)
    if (item.quantity > maxQuantity) {
      throw new Error(`La oferta ${latestOffer.title} ya no tiene stock suficiente para esa cantidad.`)
    }

    return {
      offer: { ...item.offer, ...latestOffer },
      quantity: item.quantity,
    }
  })
}

export function calculateCheckoutTotal(items) {
  return items.reduce(
    (sum, item) => sum + getOfferFinalPrice(item.offer) * item.quantity,
    0
  )
}

export async function createOrderWithCoupons({ items, userId }) {
  const total = calculateCheckoutTotal(items)

  const { data: orden, error: ordenError } = await supabase
    .from('ordenes')
    .insert([{ id_cliente: userId, total_pagado: total }])
    .select()
    .single()

  if (ordenError) throw ordenError

  const codes = []

  for (const item of items) {
    const { offer, quantity } = item
    const precioUnitario = getOfferFinalPrice(offer)

    const { data: detalle, error: detalleError } = await supabase
      .from('detalle_orden')
      .insert([{
        id_orden: orden.id,
        id_oferta: offer.id,
        cantidad: quantity,
        precio_unitario: precioUnitario,
      }])
      .select()
      .single()

    if (detalleError) throw detalleError

    for (let index = 0; index < quantity; index += 1) {
      const companyCode = offer.company_code || offer.empresas?.codigo_empresa || 'GEN'
      const randomNumber = Math.floor(1000000 + Math.random() * 9000000)
      const uniqueCode = `${companyCode}${randomNumber}`

      const { error: couponError } = await supabase
        .from('cupones')
        .insert([{
          codigo_unico: uniqueCode,
          id_oferta: offer.id,
          id_cliente: userId,
          estado_cupon: 'Disponible',
          id_detalle_orden: detalle.id,
        }])

      if (couponError) throw couponError
      codes.push(uniqueCode)
    }
  }

  return { codes, total }
}

export async function updatePurchasedOffersStock(items) {
  for (const item of items) {
    const nextStock = Math.max(0, Number(item.offer.stock ?? item.offer.available ?? 0) - item.quantity)

    const { data: updatedOffer, error: stockUpdateError } = await supabase
      .from('ofertas')
      .update({ stock: nextStock })
      .eq('id', item.offer.id)
      .select('id, stock')
      .maybeSingle()

    if (stockUpdateError) throw stockUpdateError
    if (!updatedOffer) {
      throw new Error(`No se pudo actualizar el stock de ${item.offer.title}. Revisa permisos/policies de Supabase para la tabla ofertas.`)
    }
  }
}
