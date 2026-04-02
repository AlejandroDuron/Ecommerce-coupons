import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../../store/useAppStore'
import { ArrowRight, Car, Gamepad, HeartPulse, Laptop, Rose, Utensils, } from 'lucide-react'
import styles from './CategoryGrid.module.css'
import Loader from '../ui/Loader'

export default function CategoryGrid() {
  const categoryIcons = {
    'Restaurantes': <Utensils size={28}/>,  
    'Automotriz':   <Car size={28} />,     
    'Entretenimiento': <Gamepad size={28} />,     
    'Salud':        <HeartPulse size={28} />, 
    'Tecnología':   <Laptop size={28} />, 
    'Belleza' : <Rose size={28} />, 
  }

  const IconColors = {
    'Restaurantes': "#007BFF",  
    'Automotriz': "#28A745",     
    'Entretenimiento': "#FFC107",     
    'Salud': "#6F42C1", 
    'Tecnología': "#007BFF", 
    'Belleza' : "#FF5733", 
  }


  const { setFilter, fetchCategories, loading, error, headerCategories } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSelect = (cat) => {
    setFilter('category', cat)
    navigate('/ofertas')
  }

  if (loading) {
    return <Loader/>
  }

  if (error) {
    return <div>Error: {error}</div>  
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
          {headerCategories?.map((cat) => {
            const Icon = categoryIcons[cat.nombre_rubro] || null  
            const Colors = IconColors[cat.nombre_rubro] || null  
            return (
              <button
                key={cat.nombre_rubro}
                className={`${styles.card}`}
                onClick={() => handleSelect(cat.nombre_rubro)}
                style={{ '--cat-color': Colors}}
              >
                <span className={styles.icon}>{Icon}</span>
                <span className={styles.name}>{cat.nombre_rubro}</span>
                <ArrowRight size={13} className={styles.arrow} />
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}