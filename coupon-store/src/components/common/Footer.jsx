// components/layout/Footer.jsx
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>⚡ La Cuponera</span>
          <p className={styles.tagline}>Redefiniendo el ahorro inteligente para la era digital.</p>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <span className={styles.colTitle}>Plataforma</span>
            <Link to="/">Cómo Funciona</Link>
            <Link to="/ofertas">Ver Ofertas</Link>
            <Link to="/mis-cupones">Mis Cupones</Link>
          </div>
          <div className={styles.col}>
            <span className={styles.colTitle}>Legal</span>
            <Link to="/terminos">Términos de Uso</Link>
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/contacto">Contacto</Link>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <span>© {new Date().getFullYear()} DescuentoFuture. Todos los derechos reservados.</span>
          <span className={styles.status}>● SISTEMA OPERATIVO</span>
        </div>
      </div>
    </footer>
  )
}
