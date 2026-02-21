import { createContext, useContext, useReducer, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

const initialState = {
  user:    null,
  loading: true,
  error:   null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':    return { ...state, user: action.payload, loading: false, error: null }
    case 'SET_LOADING': return { ...state, loading: action.payload }
    case 'SET_ERROR':   return { ...state, error: action.payload, loading: false }
    case 'LOGOUT':      return { ...initialState, loading: false }
    default: return state
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch({ type: 'SET_USER', payload: session?.user ?? null })
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch({ type: 'SET_USER', payload: session?.user ?? null })
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) dispatch({ type: 'SET_ERROR', payload: error.message })
    else dispatch({ type: 'SET_USER', payload: data.user })
    return { data, error }
  }

  const register = async (email, password, nombres, apellidos, telefono, dui, direccion) => {
  dispatch({ type: 'SET_LOADING', payload: true })
  
  // Construimos el objeto de metadatos de forma segura
  const userData = {
    nombres: nombres || '',
    apellidos: apellidos || '',
    telefono: telefono || '',
    dui: dui || '',
    direccion: direccion || '',
    full_name: `${nombres || ''} ${apellidos || ''}`.trim()
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { 
      data: userData
    },
  })

  if (error) dispatch({ type: 'SET_ERROR', payload: error.message })
  else dispatch({ type: 'SET_USER', payload: data.user })
  return { data, error }
}

  const logout = async () => {
    await supabase.auth.signOut()
    dispatch({ type: 'LOGOUT' })
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error }
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
