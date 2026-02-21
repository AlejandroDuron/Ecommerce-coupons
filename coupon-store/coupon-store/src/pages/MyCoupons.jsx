import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabaseClient'
import CouponCard from '../components/coupons/CouponCard'
import CouponModal from '../components/coupons/CouponModal'
import styles from './MyCoupons.module.css'
import Loader from '../components/ui/Loader'

export default function MyCoupons() {
  const { user } = useAuth()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCoupon, setSelectedCoupon] = useState(null)

  useEffect(() => {
    if (user) fetchCoupons()
  }, [user])

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('cupones')
        .select(`
          *,
          offer:id_oferta (
            id, titulo, expires_at,
            empresas ( nombre_empresa )
          )
        `)
        .eq('id_cliente', user.id)
      
      if (error) throw error
      setCoupons(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <main className="container section">
      <h1 className="section-title">Mis Cupones</h1>
      
      <div className={styles.grid}>
        {coupons.map((coupon) => {
          // LÓGICA DE ESTADOS (Punto 3 de la rúbrica)
          const isExpired = coupon.offer?.expires_at && new Date(coupon.offer.expires_at) < new Date();
          const currentStatus = (isExpired && coupon.estado_cupon === 'Disponible') ? 'Vencido' : coupon.estado_cupon;

          return (
            <div key={coupon.id} className={styles.cardWrapper}>
              <CouponCard 
                coupon={coupon} 
                onClick={() => setSelectedCoupon(coupon)} 
              />
              {/* Etiqueta de estado dinámica */}
              <span className={`${styles.badge} ${styles[currentStatus.toLowerCase()]}`}>
                {currentStatus}
              </span>
            </div>
          )
        })}
      </div>

      {selectedCoupon && (
        <CouponModal 
          coupon={selectedCoupon} 
          onClose={() => setSelectedCoupon(null)} 
        />
      )}
    </main>
  )
}
