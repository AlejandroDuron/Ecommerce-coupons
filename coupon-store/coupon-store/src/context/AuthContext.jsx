import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const { login, register, error, loading } = useAuth()
  const navigate = useNavigate()

  // Estados para el formulario de Registro
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    dui: '',
    direccion: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isLogin) {
    // Validación de DUI (Formato: 00000000-0)
    const duiRegex = /^\d{8}-\d{1}$/;
    if (!duiRegex.test(formData.dui)) {
      alert("El DUI debe tener el formato 00000000-0");
      return;
    }

    // Validación de Teléfono (8 dígitos)
    const telRegex = /^\d{8,11}$/; // Ajusta según prefieras (mínimo 8)
    if (!telRegex.test(formData.telefono)) {
      alert("El teléfono no es válido");
      return;
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2>{isLogin ? 'Iniciar Sesión' : 'Registro de Cliente'}</h2>
        
        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <>
              <div className={styles.row}>
                <input type="text" name="nombres" placeholder="Nombres" required onChange={handleChange} />
                <input type="text" name="apellidos" placeholder="Apellidos" required onChange={handleChange} />
              </div>
              <div className={styles.row}>
                <input type="text" name="dui" placeholder="DUI (00000000-0)" required onChange={handleChange} />
                <input type="tel" name="telefono" placeholder="Teléfono" required onChange={handleChange} />
              </div>
              <textarea name="direccion" placeholder="Dirección completa" required onChange={handleChange}></textarea>
            </>
          )}

          <input type="email" name="email" placeholder="Correo electrónico" required onChange={handleChange} />
          <input type="password" name="password" placeholder="Contraseña" required onChange={handleChange} />

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Procesando...' : isLogin ? 'Entrar' : 'Crear Cuenta'}
          </button>
        </form>

        <p className={styles.switchText}>
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <button onClick={() => setIsLogin(!isLogin)} className={styles.linkBtn}>
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  )
}
}
