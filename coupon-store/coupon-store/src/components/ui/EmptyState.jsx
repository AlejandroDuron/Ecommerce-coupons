// components/ui/EmptyState.jsx
import { Link } from 'react-router-dom'
import styles from './EmptyState.module.css'

export default function EmptyState({ icon = '🔍', title, message, action, actionTo }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {action && actionTo && (
        <Link to={actionTo} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          {action}
        </Link>
      )}
    </div>
  )
}
