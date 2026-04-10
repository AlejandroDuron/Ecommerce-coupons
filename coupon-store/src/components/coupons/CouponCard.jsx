// components/coupons/CouponCard.jsx
import { useState } from 'react'
import { getCouponStatus, COUPON_STATUS_LABELS } from '../../utils/helpers/couponHelpers'
import { expiryLabel } from '../../utils/helpers/formatters'
import { Utensils, Laptop, Ticket, QrCode, Car, Gamepad, HeartPulse, Rose } from 'lucide-react'
import CouponModal from './CouponModal'
import Badge from '../ui/Badge'
import styles from './CouponCard.module.css'

export default function CouponCard({ coupon }) {
  const [showModal, setShowModal] = useState(false)
  const status = getCouponStatus(coupon.status, coupon.expires_at)
  const isActive = status === 'active'

  const CATEGORY_ICONS = {
    'Restaurantes': <Utensils size={28}/>,  
    'Automotriz':   <Car size={28} />,     
    'Entretenimiento': <Gamepad size={28} />,     
    'Salud':        <HeartPulse size={28} />, 
    'Tecnología':   <Laptop size={28} />, 
    'Belleza' : <Rose size={28} />, 
  }

  return (
    <>
      <div className={`card ${styles.card} ${!isActive ? styles.dimmed : ''}`}>
        <div className={styles.top}>
          <span className={styles.catIcon}>
            {CATEGORY_ICONS[coupon.category] || <Ticket size={28} />}
          </span>
          <div className={styles.topRight}>
            <Badge variant={status}>{COUPON_STATUS_LABELS[status]}</Badge>
            <span className={styles.expiry}>{expiryLabel(coupon.expires_at)}</span>
          </div>
        </div>

        <div className={styles.body}>
          <span className={styles.company}>{coupon.company}</span>
          <h3 className={styles.title}>{coupon.title}</h3>
        </div>

        <div className={styles.footer}>
          <div className={styles.codeWrap}>
            <span className={styles.codeLabel}>CÓDIGO</span>
            <span className={styles.code}>{coupon.code}</span>
          </div>
          {isActive && (
            <button className={`btn btn-primary ${styles.viewBtn}`} onClick={() => setShowModal(true)}>
              <QrCode size={14} /> Ver Código
            </button>
          )}
        </div>
      </div>

      {showModal && <CouponModal coupon={coupon} onClose={() => setShowModal(false)} />}
    </>
  )
}
