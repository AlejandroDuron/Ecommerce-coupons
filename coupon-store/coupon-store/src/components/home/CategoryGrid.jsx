// components/home/CategoryGrid.jsx
import { useNavigate } from 'react-router-dom'
import useAppStore from '../../store/useAppStore'
import { Utensils, Leaf, Laptop, Plane, ShoppingBag, ArrowRight } from 'lucide-react'
import styles from './CategoryGrid.module.css'

const CATEGORY_DATA = [
  { name: 'Gastronomía', icon: <Utensils size={26} />, color: '#f59e0b' },
  { name: 'Bienestar',   icon: <Leaf size={26} />,     color: '#10b981' },
  { name: 'Tecnología',  icon: <Laptop size={26} />,   color: '#3b82f6' },
  { name: 'Viajes',      icon: <Plane size={26} />,    color: '#8b5cf6' },
  { name: 'Moda',        icon: <ShoppingBag size={26} />, color: '#ec4899' },
]

export default function CategoryGrid() {
  const { setFilter } = useAppStore()
  const navigate = useNavigate()

  const handleSelect = (cat) => {
    setFilter('category', cat)
    navigate('/ofertas')
  }

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h2 className="section-title">Explorar Sectores</h2>
            <p className="section-subtitle">Filtrado por relevancia</p>
          </div>
          <button className="btn btn-outline" onClick={() => { setFilter('category', ''); navigate('/ofertas') }}>
            Ver Todas <ArrowRight size={14} />
          </button>
        </div>

        <div className={styles.grid}>
          {CATEGORY_DATA.map(cat => (
            <button
              key={cat.name}
              className={styles.card}
              onClick={() => handleSelect(cat.name)}
              style={{ '--cat-color': cat.color }}
            >
              <span className={styles.icon}>{cat.icon}</span>
              <span className={styles.name}>{cat.name}</span>
              <ArrowRight size={13} className={styles.arrow} />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
