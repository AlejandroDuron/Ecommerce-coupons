// routes/PrivateRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/ui/Loader'

/**
 * Envuelve rutas que requieren autenticación.
 * Si no hay sesión, redirige a /auth guardando la ruta original.
 *
 * MODO DEMO
 */
const DEV_BYPASS = false

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (DEV_BYPASS) return children   // Sin auth requerida en modo demo

  if (loading) return <Loader fullscreen />

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children
}
