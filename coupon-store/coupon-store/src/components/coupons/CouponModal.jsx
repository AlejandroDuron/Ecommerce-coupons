import { useAuth } from '../../context/AuthContext';
import { downloadCouponPDF } from '../../utils/generatePDF';
import styles from './CouponModal.module.css';

export default function CouponModal({ coupon, onClose }) {
  const { user } = useAuth();
  const userData = user?.user_metadata;

  const handleDownload = () => {
    downloadCouponPDF('coupon-capture', `Cupon-${coupon.codigo_unico}`);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        
        {/* Este ID es el que busca el generador de PDF */}
        <div id="coupon-capture" className={styles.captureArea}>
          <div className={styles.header}>
            <h3>{coupon.offer?.titulo}</h3>
            <p className={styles.company}>{coupon.offer?.empresas?.nombre_empresa}</p>
          </div>

          {/* Datos del Cliente para la Rúbrica de la ESEN */}
          <div className={styles.customerInfo} style={{ borderBottom: '1px dashed #ccc', marginBottom: '15px', paddingBottom: '10px' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>TITULAR</p>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{userData?.nombres} {userData?.apellidos}</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>DUI: {userData?.dui}</p>
          </div>

          <div className={styles.codeSection}>
            <span className={styles.label}>CÓDIGO DE CANJE</span>
            <div className={styles.mainCode}>{coupon.codigo_unico}</div>
          </div>
        </div>

        <button className={`btn btn-primary ${styles.downloadBtn}`} onClick={handleDownload}>
          Descargar Cupón PDF
        </button>
      </div>
    </div>
  );
} 
