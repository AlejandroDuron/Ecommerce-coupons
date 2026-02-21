// components/offers/OfferCard.jsx
import { Link, useNavigate } from 'react-router-dom' // <-- Agregamos useNavigate
import { useCart } from '../../context/CartContext'
import { formatPrice, expiryLabel, daysUntil } from '../../utils/formatters'
import { Clock, Calendar, Star, ShoppingCart, ArrowRight, Check } from 'lucide-react'
import styles from './OfferCard.module.css'

export default function OfferCard({ offer }) {
  const { addToCart, items } = useCart()
  const navigate = useNavigate() // <-- Inicializamos navegación
  const inCart = items.some(i => i.offer.id === offer.id)

  const days = daysUntil(offer.expires_at)
  const urgent = days !== null && days <= 3

  const initials = offer.company?.slice(0, 2).toUpperCase() || '??'

  // <-- Nueva función que guarda y redirige
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!inCart) {
      addToCart(offer);
    }
    navigate('/checkout');
  };

  return (
    <div className={`card ${styles.card}`}>
      {/* Badge descuento */}
      <div className={styles.discountBadge}>-{offer.discount_pct}% OFF</div>

      {/* Imagen / placeholder */}
      <div className={styles.imageWrap}>
        {offer.image_url
          ? <img src={offer.image_url} alt={offer.company} className={styles.image} />
          : <div className={styles.placeholder}>{initials}</div>
        }
      </div>

      <div className={styles.body}>
        <div className={styles.companyRow}>
          <span className={styles.company}>{offer.company}</span>
          {offer.rating && (
            <span className={styles.rating}>
              <Star size={11} fill="#f59e0b" color="#f59e0b" /> {offer.rating}
            </span>
          )}
        </div>

        <h3 className={styles.title}>{offer.title}</h3>

        <div className={styles.priceRow}>
          <span className={styles.finalPrice}>{formatPrice(offer.final_price)}</span>
          <span className={styles.originalPrice}>{formatPrice(offer.original_price)}</span>
        </div>

        <div className={`${styles.expiry} ${urgent ? styles.urgent : ''}`}>
          {urgent ? <Clock size={12} /> : <Calendar size={12} />}
          {expiryLabel(offer.expires_at)}
        </div>

        <div className={styles.actions}>
          <Link to={`/ofertas/${offer.id}`} className={`btn btn-outline ${styles.detailBtn}`}>
            Ver <ArrowRight size={13} />
          </Link>
          <button
            className={`btn btn-primary ${styles.buyBtn}`}
            onClick={handleAddToCart} // <-- Usamos la nueva función
            // Eliminamos el disabled={inCart} para permitir ir al checkout
          >
            {inCart ? <><Check size={13} /> Ir a pagar</> : <><ShoppingCart size={13} /> Comprar</>}
          </button>
        </div>
      </div>
    </div>
  )
}
