// components/ui/Loader.jsx
import styles from './Loader.module.css'

export default function Loader({ fullscreen = false }) {
  if (fullscreen) {
    return (
      <div className={styles.fullscreen}>
        <div className={styles.spinner} />
      </div>
    )
  }
  return (
    <div className={styles.inline}>
      <div className={styles.spinner} />
    </div>
  )
}
