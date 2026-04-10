// context/CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'

// Estado inicial
const legacyInitialState = {
  items: [],   // [{ offer, quantity }]
}

//Reducer 
function legacyCartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find(i => i.offer.id === action.payload.id)
      if (exists) return state // 1 cupón por oferta
      return { ...state, items: [...state.items, { offer: action.payload, quantity: 1 }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.offer.id !== action.payload) }
    case 'CLEAR_CART':
      return legacyInitialState
    default:
      return state
  }
}

// Context 
const LegacyCartContext = createContext(null)

function LegacyCartProvider({ children }) {
  const [state, dispatch] = useReducer(legacyCartReducer, legacyInitialState)

  const addToCart    = (offer)   => dispatch({ type: 'ADD_ITEM',    payload: offer })
  const removeFromCart = (offerId) => dispatch({ type: 'REMOVE_ITEM', payload: offerId })
  const clearCart    = ()        => dispatch({ type: 'CLEAR_CART' })

  const total = state.items.reduce((sum, i) => sum + i.offer.final_price * i.quantity, 0)
  const savings = state.items.reduce(
    (sum, i) => sum + (i.offer.original_price - i.offer.final_price) * i.quantity, 0
  )

  return (
    <LegacyCartContext.Provider value={{ ...state, addToCart, removeFromCart, clearCart, total, savings }}>
      {children}
    </LegacyCartContext.Provider>
  )
}

const legacyUseCart = () => {
  const ctx = useContext(LegacyCartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}

const initialState = {
  items: [],
  feedback: null,
}

function getOfferFinalPrice(offer) {
  return Number(offer?.precio_oferta ?? offer?.final_price ?? offer?.price ?? 0)
}

function getOfferOriginalPrice(offer) {
  return Number(offer?.precio_regular ?? offer?.original_price ?? 0)
}

function getOfferMaxQuantity(offer) {
  const stock = Number(offer?.stock ?? offer?.available ?? 0)
  const rawLimit = offer?.cantidad_limite
  const limit = rawLimit == null ? Infinity : Number(rawLimit)
  return Math.max(0, Math.min(stock, Number.isFinite(limit) ? limit : Infinity))
}

function clampQuantity(quantity, offer) {
  const normalized = Number(quantity)
  if (!Number.isFinite(normalized)) return 1
  return Math.max(1, Math.min(Math.floor(normalized), getOfferMaxQuantity(offer)))
}

function createFeedback(type, message) {
  return {
    id: Date.now() + Math.random(),
    type,
    message,
  }
}

function getItemQuantity(items, offerId) {
  return items.find(item => item.offer.id === offerId)?.quantity ?? 0
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { offer, quantity = 1 } = action.payload
      const maxQuantity = getOfferMaxQuantity(offer)

      if (maxQuantity <= 0) {
        return {
          ...state,
          feedback: createFeedback('error', 'Este cupón ya no tiene unidades disponibles.'),
        }
      }

      const existingItem = state.items.find(item => item.offer.id === offer.id)

      if (!existingItem) {
        const nextQuantity = clampQuantity(quantity, offer)
        return {
          ...state,
          items: [...state.items, { offer, quantity: nextQuantity }],
          feedback: createFeedback(
            'success',
            nextQuantity > 1
              ? `${offer.title} se agregó al carrito con ${nextQuantity} unidades.`
              : `${offer.title} se agregó al carrito con éxito.`
          ),
        }
      }

      const nextQuantity = Math.min(existingItem.quantity + Math.max(1, Number(quantity) || 1), maxQuantity)
      if (nextQuantity === existingItem.quantity) {
        return {
          ...state,
          feedback: createFeedback('warning', 'Ya alcanzaste el máximo permitido para este cupón.'),
        }
      }

      return {
        ...state,
        items: state.items.map(item =>
          item.offer.id === offer.id ? { ...item, quantity: nextQuantity, offer: { ...item.offer, ...offer } } : item
        ),
        feedback: createFeedback('success', `${offer.title} se actualizó en tu carrito.`),
      }
    }

    case 'UPDATE_QUANTITY': {
      const { offerId, quantity } = action.payload
      const item = state.items.find(entry => entry.offer.id === offerId)
      if (!item) return state

      const maxQuantity = getOfferMaxQuantity(item.offer)
      if (maxQuantity <= 0) {
        return {
          ...state,
          items: state.items.filter(entry => entry.offer.id !== offerId),
          feedback: createFeedback('warning', `${item.offer.title} se eliminó porque ya no tiene stock disponible.`),
        }
      }

      const nextQuantity = clampQuantity(quantity, item.offer)
      if (nextQuantity === item.quantity) return state

      return {
        ...state,
        items: state.items.map(entry =>
          entry.offer.id === offerId ? { ...entry, quantity: nextQuantity } : entry
        ),
        feedback: createFeedback('info', `Actualizaste la cantidad de ${item.offer.title}.`),
      }
    }

    case 'REMOVE_ITEM': {
      const item = state.items.find(entry => entry.offer.id === action.payload)
      return {
        ...state,
        items: state.items.filter(entry => entry.offer.id !== action.payload),
        feedback: item ? createFeedback('info', `${item.offer.title} se eliminó del carrito.`) : state.feedback,
      }
    }

    case 'CLEAR_CART':
      return {
        ...initialState,
        feedback: state.items.length ? createFeedback('info', 'Tu carrito quedó vacío.') : state.feedback,
      }

    case 'SYNC_OFFERS': {
      const nextItems = state.items
        .map(item => {
          const latestOffer = action.payload.find(offer => offer.id === item.offer.id)
          if (!latestOffer) return item

          const nextQuantity = Math.min(item.quantity, getOfferMaxQuantity(latestOffer))
          if (nextQuantity <= 0) return null

          return {
            offer: { ...item.offer, ...latestOffer },
            quantity: nextQuantity,
          }
        })
        .filter(Boolean)

      return { ...state, items: nextItems }
    }

    case 'DISMISS_FEEDBACK':
      return { ...state, feedback: null }

    default:
      return state
  }
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (!state.feedback) return undefined

    timeoutRef.current = window.setTimeout(() => {
      dispatch({ type: 'DISMISS_FEEDBACK' })
    }, 2800)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [state.feedback])

  const value = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + getOfferOriginalPrice(item.offer) * item.quantity,
      0
    )
    const total = state.items.reduce(
      (sum, item) => sum + getOfferFinalPrice(item.offer) * item.quantity,
      0
    )
    const savings = subtotal - total
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

    return {
      ...state,
      itemCount,
      subtotal,
      total,
      savings,
      addToCart: (offer, quantity = 1) => dispatch({ type: 'ADD_ITEM', payload: { offer, quantity } }),
      removeFromCart: (offerId) => dispatch({ type: 'REMOVE_ITEM', payload: offerId }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      incrementItem: (offerId) => dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { offerId, quantity: getItemQuantity(state.items, offerId) + 1 },
      }),
      decrementItem: (offerId) => dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { offerId, quantity: Math.max(1, getItemQuantity(state.items, offerId) - 1) },
      }),
      updateQuantity: (offerId, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { offerId, quantity } }),
      syncOffers: (offers) => dispatch({ type: 'SYNC_OFFERS', payload: offers }),
      dismissFeedback: () => dispatch({ type: 'DISMISS_FEEDBACK' }),
      getItemMaxQuantity: (offerId) => {
        const item = state.items.find(entry => entry.offer.id === offerId)
        return item ? getOfferMaxQuantity(item.offer) : 0
      },
    }
  }, [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}

export { getOfferFinalPrice, getOfferOriginalPrice, getOfferMaxQuantity }
