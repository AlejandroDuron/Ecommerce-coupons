import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../../store/useAppStore'
import { ArrowRight } from 'lucide-react'
import styles from './CategoryGrid.module.css'
import Loader from '../ui/Loader'

export default function CategoryGrid() {
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
          {headerCategories?.map((cat, index) => (
            <button
              key={index} 
              className={`${styles.card}`}
              onClick={() => handleSelect(cat.nombre_rubro)}
            >
              <span className={styles.name}>{cat.nombre_rubro}</span>
              <ArrowRight size={13} className={styles.arrow} />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}