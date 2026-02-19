// pages/Auth.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Zap, ShieldCheck, Ticket, Star,
  Eye, EyeOff, ArrowRight, ChevronLeft,
  AlertCircle, CheckCircle2, Activity
} from 'lucide-react'
import styles from './Auth.module.css'

const FEATURES = [
  { icon: <ShieldCheck size={15} />, label: 'Seguridad total' },
  { icon: <Zap size={15} />,         label: 'Cupones instantáneos' },
  { icon: <Star size={15} />,        label: 'Ofertas exclusivas' },
]

// Tres modos: 'login' | 'register' | 'forgot'
export default function Auth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [localError, setLocalError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const { login, register, resetPassword, user, loading, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user])

  const update = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); setLocalError('') }
  const switchMode = (m) => { setMode(m); setLocalError(''); setSuccessMsg('') }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return setLocalError('Completá todos los campos.')
    const { error: err } = await login(form.email, form.password)
    if (err) setLocalError(err.message || 'Credenciales incorrectas.')
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return setLocalError('Completá todos los campos.')
    if (form.password !== form.confirm) return setLocalError('Las contraseñas no coinciden.')
    if (form.password.length < 6) return setLocalError('La contraseña debe tener al menos 6 caracteres.')
    const { error: err } = await register(form.email, form.password, form.name)
    if (err) setLocalError(err.message)
    else setSuccessMsg('¡Cuenta creada! Revisá tu correo para confirmar.')
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    if (!form.email) return setLocalError('Ingresá tu correo.')
    const { error: err } = await resetPassword(form.email)
    if (err) setLocalError(err.message)
    else setSuccessMsg('Te enviamos un link para restablecer tu contraseña.')
  }

  // Demo sin Supabase 
  // OJO: al conectar backend borren esto 
  const fillDemo = () => {
    setForm(f => ({ ...f, email: 'demo@descuentofuture.com', password: 'demo123' }))
    setLocalError('')
  }

  const displayError = localError || error

  return (
    <div className={styles.page}>

      {/* ── Panel decorativo ── */}
      <div className={styles.deco} aria-hidden="true">
        <div className={styles.decoOrb} />
        <div className={styles.decoContent}>
          <div className={styles.decoLogo}><Zap size={28} strokeWidth={2.5} /></div>
          <h2 className={styles.decoTitle}>Futuro de<br />los Ahorros</h2>
          <p className={styles.decoText}>
            Accede a una red exclusiva de cupones digitales con verificación instantánea.
          </p>
          <div className={styles.decoFeatures}>
            {FEATURES.map(f => (
              <div key={f.label} className={styles.decoFeature}>
                <span className={styles.decoFeatureIcon}>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>
          <div className={styles.decoStatus}>
            <Activity size={12} /> Sistema Online v4.0
          </div>
        </div>
      </div>

      {/* ── Panel formulario ── */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.logo}>
            <Zap size={17} color="var(--green)" /> La Cuponera
          </div>

          {mode !== 'forgot' && (
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`} onClick={() => switchMode('login')}>Iniciar Sesión</button>
              <button className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`} onClick={() => switchMode('register')}>Registrarse</button>
            </div>
          )}

          {mode === 'forgot' && (
            <div className={styles.formHeader}>
              <h2>Recuperar contraseña</h2>
              <p>Te enviaremos un link a tu correo.</p>
            </div>
          )}

          {displayError && <div className={styles.errorMsg}><AlertCircle size={14} /> {displayError}</div>}
          {successMsg  && <div className={styles.successMsg}><CheckCircle2 size={14} /> {successMsg}</div>}

          {/* Login */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className={styles.form}>
              <div className="input-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input id="email" type="email" className="input-field" placeholder="tu@correo.com" value={form.email} onChange={update('email')} autoComplete="email" />
              </div>
              <div className="input-group">
                <label htmlFor="password">Contraseña</label>
                <div className={styles.passWrap}>
                  <input id="password" type={showPass ? 'text' : 'password'} className="input-field" placeholder="••••••••" value={form.password} onChange={update('password')} autoComplete="current-password" />
                  <button type="button" className={styles.showPass} onClick={() => setShowPass(s => !s)}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className={styles.forgotRow}>
                <button type="button" className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: 0 }} onClick={() => switchMode('forgot')}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
                {loading ? 'Ingresando...' : <><span>Iniciar Sesión</span><ArrowRight size={15} /></>}
              </button>
              {/* Badge de prueba – eliminar cuando Supabase esté configurado */}
              <div className={styles.demoBox}>
                <span className={styles.demoLabel}><Ticket size={12} /> Sin Supabase configurado</span>
                <button type="button" className={styles.demoBtn} onClick={fillDemo}>Rellenar demo</button>
              </div>
            </form>
          )}

          {/* Register */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className={styles.form}>
              <div className="input-group">
                <label>Nombre completo</label>
                <input type="text" className="input-field" placeholder="Juan Pérez" value={form.name} onChange={update('name')} />
              </div>
              <div className="input-group">
                <label>Correo Electrónico</label>
                <input type="email" className="input-field" placeholder="tu@correo.com" value={form.email} onChange={update('email')} autoComplete="email" />
              </div>
              <div className="input-group">
                <label>Contraseña</label>
                <div className={styles.passWrap}>
                  <input type={showPass ? 'text' : 'password'} className="input-field" placeholder="Mín. 6 caracteres" value={form.password} onChange={update('password')} />
                  <button type="button" className={styles.showPass} onClick={() => setShowPass(s => !s)}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label>Confirmar Contraseña</label>
                <input type="password" className="input-field" placeholder="Repetí tu contraseña" value={form.confirm} onChange={update('confirm')} />
              </div>
              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
                {loading ? 'Creando cuenta...' : <><span>Crear Cuenta</span><ArrowRight size={15} /></>}
              </button>
              <p className={styles.legal}>Al registrarte aceptás nuestros <a href="/terminos">Términos</a> y <a href="/privacidad">Privacidad</a>.</p>
            </form>
          )}

          {/* Forgot */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className={styles.form}>
              <div className="input-group">
                <label>Correo Electrónico</label>
                <input type="email" className="input-field" placeholder="tu@correo.com" value={form.email} onChange={update('email')} />
              </div>
              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
                {loading ? 'Enviando...' : <><span>Enviar Link</span><ArrowRight size={15} /></>}
              </button>
              <button type="button" className={`btn btn-ghost ${styles.backBtn}`} onClick={() => switchMode('login')}>
                <ChevronLeft size={15} /> Volver al login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
