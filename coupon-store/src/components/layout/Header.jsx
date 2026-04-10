// components/layout/Header.jsx
import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import useAppStore from '../../store/useAppStore'
import { Zap, Search, Ticket, ChevronDown, LogOut, User } from 'lucide-react'
import styles from './Header.module.css'

export default function Header() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const { filters, setFilter, categories } = useAppStore()
  const navigate = useNavigate()

  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [searchVal, setSearchVal]   = useState(filters.search)

  // Sombra al hacer scroll
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setFilter('search', searchVal)
    navigate('/ofertas')
  }

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>

        {/* ── Logo ── */}
        <Link to="/" className={styles.logo}>
          <Zap size={18} color="var(--green)" strokeWidth={2.5} />
          <span>La Cuponera</span>
        </Link>

        {/* ── Buscador ── */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <Search size={14} className={styles.searchIconSvg} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar ofertas, marcas..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn}>Buscar</button>
        </form>

        {/* ── Nav desktop ── */}
        <nav className={styles.nav}>
          <NavLink to="/ofertas" className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>
            Ofertas
          </NavLink>
          {user && (
            <NavLink to="/mis-cupones" className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>
              Mis Cupones
              {items.length > 0 && <span className={styles.badge}>{items.length}</span>}
            </NavLink>
          )}
          {user ? (
            <div className={styles.userMenu}>
              <button className={styles.userBtn} onClick={() => setMenuOpen(o => !o)}>
                <span className={styles.avatar}>{user.email?.[0]?.toUpperCase()}</span>
                <span className={styles.userName}>{user.user_metadata?.full_name?.split(' ')[0] || 'Mi cuenta'}</span>
                <ChevronDown size={13} />
              </button>
              {menuOpen && (
                <div className={styles.dropdown}>
                  <Link to="/mis-cupones" className={styles.dropItem} onClick={() => setMenuOpen(false)}>
                    <Ticket size={14} /> Mis Cupones
                  </Link>
                  <button className={styles.dropItem} onClick={handleLogout}>
                    <LogOut size={14} /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
              Ingresar
            </Link>
          )}
        </nav>

        {/* ── Hamburger mobile ── */}
        <button className={styles.hamburger} onClick={() => setMenuOpen(o => !o)} aria-label="Menú">
          <span /><span /><span />
        </button>
      </div>

      {/* ── Menú mobile ── */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <input
              type="text"
              className="input-field"
              placeholder="Buscar ofertas..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
            />
          </form>
          <Link to="/ofertas" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Ofertas</Link>
          {user && (
            <Link to="/mis-cupones" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Mis Cupones</Link>
          )}
          {user
            ? <button className={`${styles.mobileLink} btn-ghost`} onClick={handleLogout}>Cerrar Sesión</button>
            : <Link to="/auth" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Ingresar / Registrarse</Link>
          }
        </div>
      )}

      {/* ── Filtro por categorías ── */}
      <div className={styles.catBar}>
        <div className={`container ${styles.catInner}`}>
          <button
            className={`${styles.catBtn} ${!filters.category ? styles.catActive : ''}`}
            onClick={() => setFilter('category', '')}
          >Todas</button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.catBtn} ${filters.category === cat ? styles.catActive : ''}`}
              onClick={() => { setFilter('category', cat); navigate('/ofertas') }}
            >{cat}</button>
          ))}
        </div>
      </div>
    </header>
  )
}
