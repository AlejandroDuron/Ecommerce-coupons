// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/auth/AuthContext'
import { CartProvider } from './context/cart/CartContext'
import PrivateRoute from './routes/PrivateRoute'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import Home from './pages/Home/Home'
import Offers from './pages/Offers/Offers'
import OfferDetail from './pages/OfferDetail/OfferDetail'
import Auth from './pages/Auth/Auth'
import MyCoupons from './pages/Coupons/MyCoupons'
import Checkout from './pages/Checkout/Checkout'
import Cart from './pages/Cart/Cart'
import NotFound from './pages/NotFound/NotFound'

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
            <Route path="/carrito" element={<Layout><Cart /></Layout>} />
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
