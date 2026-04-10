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
const maskDUI = (val) => {
  let value = val.replace(/\D/g, ''); // Elimina todo lo que no sea número
  if (value.length > 8) {
    value = value.slice(0, 8) + '-' + value.slice(8, 9);
  }
  return value.slice(0, 10); // Límite de 10 caracteres
};

// Función para el teléfono 
const maskTel = (val) => {
  return val.replace(/\D/g, '').slice(0, 8);
};

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    confirm: '',
    nombres: '',
    apellidos: '',
    dui: '',
    telefono: '',
    direccion: ''
  })
  
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

  const update = (field) => (e) => {
  let value = e.target.value;

  // Aplicamos las máscaras según el campo
  if (field === 'dui') value = maskDUI(value);
  if (field === 'telefono') value = maskTel(value);

  setForm(f => ({ ...f, [field]: value }));
  setLocalError('');
};
  
  const switchMode = (m) => { setMode(m); setLocalError(''); setSuccessMsg('') }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return setLocalError('Completá todos los campos.')
    const { error: err } = await login(form.email, form.password)
    if (err) setLocalError(err.message || 'Credenciales incorrectas.')
  }
  const handleRegister = async (e) => {
    e.preventDefault()
    
    // Validamos campos obligatorios
    if (!form.email || !form.password || !form.nombres || !form.dui) {
      return setLocalError('Completá los campos obligatorios.')
    }
    
    if (form.password !== form.confirm) return setLocalError('Las contraseñas no coinciden.')
    if (form.password.length < 6) return setLocalError('Mínimo 6 caracteres.')

    // Enviamos los 7 parámetros en el orden correcto
    const { error: err } = await register(
      form.email, 
      form.password, 
      form.nombres, 
      form.apellidos, 
      form.telefono, 
      form.dui, 
      form.direccion
    )

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

  const displayError = localError || error

  return (
    <div className={styles.page}>
      <div className={styles.deco} aria-hidden="true">
        <div className={styles.decoOrb} />
        <div className={styles.decoContent}>
          <div className={styles.decoLogo}><Zap size={28} strokeWidth={2.5} /></div>
          <h2 className={styles.decoTitle}>Futuro de<br />los Ahorros</h2>
          <p className={styles.decoText}>Accede a una red exclusiva de cupones digitales con verificación instantánea.</p>
          <div className={styles.decoFeatures}>
            {FEATURES.map(f => (
              <div key={f.label} className={styles.decoFeature}>
                <span className={styles.decoFeatureIcon}>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>
          <div className={styles.decoStatus}><Activity size={12} /> Sistema Online v4.0</div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.logo}><Zap size={17} color="var(--green)" /> La Cuponera</div>

          {mode !== 'forgot' && (
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`} onClick={() => switchMode('login')}>Iniciar Sesión</button>
              <button className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`} onClick={() => switchMode('register')}>Registrarse</button>
            </div>
          )}

          {displayError && <div className={styles.errorMsg}><AlertCircle size={14} /> {displayError}</div>}
          {successMsg  && <div className={styles.successMsg}><CheckCircle2 size={14} /> {successMsg}</div>}

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
                <button type="button" className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: 0 }} onClick={() => switchMode('forgot')}>¿Olvidaste tu contraseña?</button>
              </div>
              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
                {loading ? 'Ingresando...' : <><span>Iniciar Sesión</span><ArrowRight size={15} /></>}
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className={styles.form}>
              <div className={styles.row}>
                <div className="input-group">
                  <label>Nombres</label>
                  <input type="text" className="input-field" placeholder="Juan" value={form.nombres} onChange={update('nombres')} required />
                </div>
                <div className="input-group">
                  <label>Apellidos</label>
                  <input type="text" className="input-field" placeholder="Pérez" value={form.apellidos} onChange={update('apellidos')} required />
                </div>
              </div>

              <div className={styles.row}>
                <div className="input-group">
                  <label>DUI (00000000-0)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="01234567-8" 
                    value={form.dui} 
                    onChange={update('dui')} 
                    maxLength={10}
                    required 
                  />
              </div>
                <div className="input-group">
                  <label>Teléfono</label>
                  <input type="tel" className="input-field" placeholder="77778888" value={form.telefono} onChange={update('telefono')} required />
                </div>
              </div>

              <div className="input-group">
                <label>Dirección</label>
                <textarea className="input-field" placeholder="Barrio El Centro, SS" value={form.direccion} onChange={update('direccion')} required />
              </div>

              <div className="input-group">
                <label>Correo Electrónico</label>
                <input type="email" className="input-field" placeholder="tu@correo.com" value={form.email} onChange={update('email')} autoComplete="email" required />
              </div>

              <div className="input-group">
                <label>Contraseña</label>
                <div className={styles.passWrap}>
                  <input type={showPass ? 'text' : 'password'} className="input-field" placeholder="Mín. 6 caracteres" value={form.password} onChange={update('password')} required />
                  <button type="button" className={styles.showPass} onClick={() => setShowPass(s => !s)}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Confirmar Contraseña</label>
                <input type="password" className="input-field" placeholder="Repetí tu contraseña" value={form.confirm} onChange={update('confirm')} required />
              </div>

              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
                {loading ? 'Creando cuenta...' : <><span>Crear Cuenta</span><ArrowRight size={15} /></>}
              </button>
            </form>
          )}

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
