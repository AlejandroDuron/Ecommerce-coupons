// pages/NotFound.jsx
import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

export default function NotFound() {
  return (
    <div className={styles.page}>
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>Página no encontrada</h1>
      <p className={styles.sub}>La URL que buscás no existe o fue movida.</p>
      <Link to="/" className="btn btn-primary">← Volver al inicio</Link>
    </div>
  )
}
