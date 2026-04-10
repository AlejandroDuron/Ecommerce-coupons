// components/home/FeaturedOffers.jsx
import { Link } from 'react-router-dom'
import useAppStore from '../../store/useAppStore'
import OfferCard from '../offers/OfferCard'
import Loader from '../ui/Loader'
import styles from './FeaturedOffers.module.css'

export default function FeaturedOffers() {
  const { loading, getFeaturedOffers } = useAppStore()
  const featured = getFeaturedOffers()

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <div className={styles.pill}>🔥 OFERTAS DESTACADAS</div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Las mejores del momento</h2>
          </div>
          <Link to="/ofertas" className="btn btn-outline">Ver todas →</Link>
        </div>

        {loading
          ? <Loader />
          : (
            <div className="offers-grid">
              {featured.map(offer => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          )
        }
      </div>
    </section>
  )
}
