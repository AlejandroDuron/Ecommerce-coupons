// context/CartContext.jsx
import { createContext, useContext, useReducer } from 'react'

// Estado inicial
const initialState = {
  items: [],   // [{ offer, quantity }]
}

//Reducer 
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find(i => i.offer.id === action.payload.id)
      if (exists) return state // 1 cupón por oferta
      return { ...state, items: [...state.items, { offer: action.payload, quantity: 1 }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.offer.id !== action.payload) }
    case 'CLEAR_CART':
      return initialState
    default:
      return state
  }
}

// Context 
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addToCart    = (offer)   => dispatch({ type: 'ADD_ITEM',    payload: offer })
  const removeFromCart = (offerId) => dispatch({ type: 'REMOVE_ITEM', payload: offerId })
  const clearCart    = ()        => dispatch({ type: 'CLEAR_CART' })

  const total = state.items.reduce((sum, i) => sum + i.offer.final_price * i.quantity, 0)
  const savings = state.items.reduce(
    (sum, i) => sum + (i.offer.original_price - i.offer.final_price) * i.quantity, 0
  )

  return (
    <CartContext.Provider value={{ ...state, addToCart, removeFromCart, clearCart, total, savings }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
