// components/coupons/CouponModal.jsx
import { useEffect } from 'react'
import styles from './CouponModal.module.css'

export default function CouponModal({ coupon, onClose }) {
  // Cerrar con Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <div className={styles.icon}>{coupon.category === 'Gastronomía' ? '🍜' : '🎫'}</div>
        <h2 className={styles.company}>{coupon.company}</h2>
        <p className={styles.title}>{coupon.title}</p>
        <p className={styles.hint}>Escanea o presenta este código en caja</p>

        {/* QR simulado */}
        <div className={styles.qrBox}>
          <div className={styles.qrGrid} aria-hidden="true">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className={styles.qrCell} style={{ opacity: Math.random() > 0.4 ? 1 : 0 }} />
            ))}
          </div>
        </div>

        <div className={styles.codeBox}>
          <span className={styles.codeLabel}>TU CÓDIGO</span>
          <span className={styles.code}>{coupon.code}</span>
        </div>

        <button className={`btn btn-primary ${styles.doneBtn}`} onClick={onClose}>
          Listo ✓
        </button>
      </div>
    </div>
  )
}
