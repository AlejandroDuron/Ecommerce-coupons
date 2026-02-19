// components/home/HeroSection.jsx
import { Link } from 'react-router-dom'
import { ArrowRight, Network, Zap, TrendingUp } from 'lucide-react'
import styles from './HeroSection.module.css'

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      {/* Fondo animado */}
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.grid} />
      </div>

      <div className={`container ${styles.content}`}>
        <div className={styles.pill}>
          <span className={styles.dot} />
          Sincronización de Ofertas Activa
        </div>

        <h1 className={styles.title}>
          AHORRA EN
          <span className={styles.accent}> GRANDE</span>
        </h1>

        <p className={styles.sub}>
          Accede a la red de descuentos más avanzada del mercado.
          Cupones instantáneos, ahorros inteligentes y experiencias exclusivas.
        </p>

        <div className={styles.actions}>
          <Link to="/ofertas" className={`btn btn-primary ${styles.ctaBtn}`}>
            Ver Ofertas <ArrowRight size={16} />
          </Link>
          <Link to="/ofertas" className={`btn btn-outline ${styles.ctaBtn}`}>
            <Network size={16} /> Explorar Red
          </Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>500+</span>
            <span className={styles.statLabel}>Ofertas activas</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>10k+</span>
            <span className={styles.statLabel}>Clientes</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>70%</span>
            <span className={styles.statLabel}>Max descuento</span>
          </div>
        </div>
      </div>
    </section>
  )
}
