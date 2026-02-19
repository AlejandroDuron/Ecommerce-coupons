// components/offers/OfferFilters.jsx
import useAppStore from '../../store/useAppStore'
import styles from './OfferFilters.module.css'

const DISCOUNT_OPTIONS = [0, 10, 30, 50, 70]
const SORT_OPTIONS = [
  { value: 'featured',  label: 'Destacados' },
  { value: 'discount',  label: 'Mayor descuento' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'newest',    label: 'Más nuevos' },
]

export default function OfferFilters({ onClose }) {
  const { filters, setFilter, clearFilters, categories } = useAppStore()

  return (
    <aside className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>🎚 Filtros</span>
        <button className="btn btn-ghost" onClick={clearFilters} style={{ fontSize: '0.7rem' }}>
          Limpiar todo
        </button>
        {onClose && (
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        )}
      </div>

      {/* Categoría */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>Categoría</span>
        <div className={styles.optList}>
          <button
            className={`${styles.opt} ${!filters.category ? styles.optActive : ''}`}
            onClick={() => setFilter('category', '')}
          >Todas</button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.opt} ${filters.category === cat ? styles.optActive : ''}`}
              onClick={() => setFilter('category', cat)}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* % Descuento mínimo */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>% Descuento mínimo</span>
        <div className={styles.optList}>
          {DISCOUNT_OPTIONS.map(d => (
            <button
              key={d}
              className={`${styles.opt} ${filters.minDiscount === d ? styles.optActive : ''}`}
              onClick={() => setFilter('minDiscount', d)}
            >{d === 0 ? 'Todos' : `${d}%+`}</button>
          ))}
        </div>
      </div>

      {/* Ordenar */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>Ordenar por</span>
        <div className={styles.optList}>
          {SORT_OPTIONS.map(s => (
            <button
              key={s.value}
              className={`${styles.opt} ${filters.sortBy === s.value ? styles.optActive : ''}`}
              onClick={() => setFilter('sortBy', s.value)}
            >{s.label}</button>
          ))}
        </div>
      </div>
    </aside>
  )
}
