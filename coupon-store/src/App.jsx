// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import PrivateRoute from './routes/PrivateRoute'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Offers from './pages/Offers'
import OfferDetail from './pages/OfferDetail'
import Auth from './pages/Auth'
import MyCoupons from './pages/MyCoupons'
import Checkout from './pages/Checkout'
import NotFound from './pages/NotFound'

// Layout que envuelve Header + contenido + Footer
// El padding-top compensa el header fijo (60px barra principal + ~38px categorías)
const Layout = ({ children }) => (
  <>
    <Header />
    <div style={{ paddingTop: '98px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>{children}</div>
      <Footer />
    </div>
  </>
)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/ofertas" element={<Layout><Offers /></Layout>} />
            <Route path="/ofertas/:id" element={<Layout><OfferDetail /></Layout>} />
            <Route path="/auth" element={<Auth />} />

            {/* Rutas privadas (requieren login) */}
            <Route
              path="/mis-cupones"
              element={
                <PrivateRoute>
                  <Layout><MyCoupons /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <Layout><Checkout /></Layout>
                </PrivateRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
