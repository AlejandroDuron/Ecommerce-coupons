// pages/MyCoupons.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useAppStore from '../store/useAppStore'
import { getCouponStatus } from '../utils/couponHelpers'
import CouponCard from '../components/coupons/CouponCard'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import styles from './MyCoupons.module.css'

const TABS = ['active', 'used', 'expired']
const TAB_LABELS = { active: 'Activos', used: 'Usados', expired: 'Vencidos' }

export default function MyCoupons() {
  const { user } = useAuth()
  const { userCoupons, fetchUserCoupons, loading } = useAppStore()
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    if (user) fetchUserCoupons(user.id)
  }, [user])

  const byStatus = (status) =>
    userCoupons.filter(c => getCouponStatus(c.status, c.expires_at) === status)

  const tabCounts = {
    active:  byStatus('active').length,
    used:    byStatus('used').length,
    expired: byThis('expired'),
  }

  function byThis(s) { return userCoupons.filter(c => getCouponStatus(c.status, c.expires_at) === s).length }

  const displayed = byStatus(activeTab)

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario'

  return (
    <main className={styles.main}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.avatar}>{userName[0]?.toUpperCase()}</div>
          <div>
            <h1 className={styles.title}>Mis Cupones</h1>
            <p className={styles.sub}>{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {TAB_LABELS[tab]}
              <span className={styles.count}>{byThis(tab)}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <Loader />
        ) : displayed.length === 0 ? (
          <EmptyState
            icon={activeTab === 'active' ? '🎫' : '📭'}
            title={`No tenés cupones ${TAB_LABELS[activeTab].toLowerCase()}`}
            message={activeTab === 'active' ? 'Explorá las ofertas y comprá tu primer cupón.' : undefined}
            action={activeTab === 'active' ? 'Ver Ofertas' : undefined}
            actionTo="/ofertas"
          />
        ) : (
          <div className={styles.grid}>
            {displayed.map(coupon => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        )}

        {/* Promo banner */}
        {activeTab === 'active' && displayed.length > 0 && (
          <div className={styles.promoBanner}>
            <div>
              <h3 className={styles.promoTitle}>¿Querés más descuentos?</h3>
              <p className={styles.promoText}>Explorá nuevas ofertas disponibles para vos.</p>
            </div>
            <Link to="/ofertas" className="btn btn-primary">Ver Ofertas →</Link>
          </div>
        )}
      </div>
    </main>
  )
}
