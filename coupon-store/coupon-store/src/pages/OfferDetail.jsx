// pages/OfferDetail.jsx
import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import useAppStore from '../store/useAppStore'
import { useCart } from '../context/CartContext'
import { formatPrice, expiryLabel, daysUntil } from '../utils/formatters'
import Loader from '../components/ui/Loader'
import styles from './OfferDetail.module.css'

export default function OfferDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getOfferById, fetchOffers, offers, loading } = useAppStore()
  const { addToCart, items } = useCart()

  useEffect(() => {
    if (!offers.length) fetchOffers()
  }, [])

  const offer = getOfferById(id)
  const inCart = items.some(i => i.offer.id === offer?.id)

  const handleBuy = () => {
    if (offer && !inCart) addToCart(offer)
    navigate('/checkout')
  }

  if (loading && !offer) return <Loader fullscreen />
  if (!loading && !offer) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Oferta no encontrada</h2>
        <Link to="/ofertas" className="btn btn-primary" style={{ marginTop: '1rem' }}>← Volver a ofertas</Link>
      </div>
    )
  }
  if (!offer) return <Loader />

  const days = daysUntil(offer.expires_at)
  const urgent = days !== null && days <= 3
  const initials = offer.company?.slice(0, 2).toUpperCase()

  return (
    <main className={styles.main}>
      <div className="container">
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ padding: '0.4rem 0' }}>
            ← Volver
          </button>
          <span className={styles.breadSep}>/</span>
          <span className={styles.breadCat}>{offer.category}</span>
        </div>

        <div className={styles.layout}>
          {/* ── Imagen ── */}
          <div className={styles.imageCol}>
            <div className={styles.imageWrap}>
              {offer.image_url
                ? <img src={offer.image_url} alt={offer.company} className={styles.image} />
                : <div className={styles.imagePlaceholder}>{initials}</div>
              }
              <div className={styles.discountOverlay}>-{offer.discount_pct}% OFF</div>
            </div>
          </div>

          {/* ── Info ── */}
          <div className={styles.infoCol}>
            <div className={styles.companyRow}>
              <span className={styles.company}>{offer.company}</span>
              {offer.rating && <span className={styles.rating}>★ {offer.rating}</span>}
            </div>

            <h1 className={styles.title}>{offer.title}</h1>

            {/* Descripción */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📋 Descripción</h3>
              <p className={styles.description}>{offer.description}</p>
            </div>

            {/* Condiciones */}
            {offer.conditions?.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>📌 Términos y Condiciones</h3>
                <ul className={styles.conditions}>
                  {offer.conditions.map((c, i) => (
                    <li key={i} className={styles.condition}>
                      <span className={styles.condIcon}>✓</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Precio + CTA */}
            <div className={styles.buyBox}>
              <div className={styles.priceRow}>
                <span className={styles.finalPrice}>{formatPrice(offer.final_price)}</span>
                <span className={styles.originalPrice}>{formatPrice(offer.original_price)}</span>
                <span className={styles.savings}>
                  Ahorras {formatPrice(offer.original_price - offer.final_price)}
                </span>
              </div>

              <div className={`${styles.expiry} ${urgent ? styles.urgent : ''}`}>
                {urgent ? '⏰' : '📅'} {expiryLabel(offer.expires_at)}
              </div>

              <button className={`btn btn-primary ${styles.buyBtn}`} onClick={handleBuy}>
                {inCart ? 'Ir al checkout →' : 'Comprar Cupón →'}
              </button>

              <p className={styles.secure}>🔒 Pago seguro garantizado</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

