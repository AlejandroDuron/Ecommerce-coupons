// pages/Offers.jsx
import { useEffect, useState } from 'react'
import useAppStore from '../store/useAppStore'
import OfferCard from '../components/offers/OfferCard'
import OfferFilters from '../components/offers/OfferFilters'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import styles from './Offers.module.css'

const PAGE_SIZE = 9

export default function Offers() {
  const { fetchOffers, offers, loading, filters, getFilteredOffers, clearFilters } = useAppStore()
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (!offers.length) fetchOffers()
  }, [])

  // Reset page cuando cambian filtros
  useEffect(() => { setPage(1) }, [filters])

  const filtered = getFilteredOffers()
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.title}>Explorar Ofertas</h1>
            <p className={styles.count}>
              {loading ? 'Cargando...' : `${filtered.length} cupones disponibles`}
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => setShowFilters(o => !o)}>
            🎚 Filtros {showFilters ? '▲' : '▼'}
          </button>
        </div>

        <div className={styles.layout}>
          {/* Sidebar desktop / mobile drawer */}
          <div className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
            <OfferFilters onClose={() => setShowFilters(false)} />
          </div>

          {/* Grilla */}
          <div className={styles.content}>
            {loading ? (
              <Loader />
            ) : paginated.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No encontramos ofertas"
                message="Probá con otros filtros o buscá algo diferente."
                action="Limpiar filtros"
                actionTo="/ofertas"
              />
            ) : (
              <>
                <div className="offers-grid">
                  {paginated.map(offer => <OfferCard key={offer.id} offer={offer} />)}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className="btn btn-outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >‹ Anterior</button>

                    <div className={styles.pages}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                          key={p}
                          className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                          onClick={() => setPage(p)}
                        >{p}</button>
                      ))}
                    </div>

                    <button
                      className="btn btn-outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >Siguiente ›</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
