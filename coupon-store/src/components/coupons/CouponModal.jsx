import { useEffect } from 'react'
import styles from './CouponModal.module.css'
import { downloadCouponPDF } from '../../utils/pdf/generatePDF'

export default function CouponModal({ coupon, onClose }) {
  // Cerrar con Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  // 2. Función para manejar la descarga del PDF
  const handleDownload = (e) => {
    e.stopPropagation(); // Evita interferencias con el clic del modal
    // Usamos el ID 'coupon-capture' que definiremos abajo
    downloadCouponPDF('coupon-capture', `Cupon-${coupon.code}`);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* 3. Agregamos el id="coupon-capture" al div principal del modal */}
      <div id="coupon-capture" className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <div className={styles.icon}>{coupon.category === 'Gastronomía' ? '🍜' : '🎫'}</div>
        <h2 className={styles.company}>{coupon.company}</h2>
        <p className={styles.title}>{coupon.title}</p>
        
        {/* Actualizamos el texto según el requerimiento del DUI  */}
        <p className={styles.hint}>Presenta este código y tu DUI en el establecimiento</p>

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

        {/* 4. Contenedor para los botones de acción */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', width: '100%' }}>
          <button 
            type="button"
            className="btn btn-outline" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={handleDownload}
          >
            📥 PDF
          </button>
          
          <button 
            className={`btn btn-primary ${styles.doneBtn}`} 
            style={{ flex: 2, marginTop: 0 }} 
            onClick={onClose}
          >
            Listo ✓
          </button>
        </div>
      </div>
    </div>
  )
}
