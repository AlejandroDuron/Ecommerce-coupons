// pages/Checkout.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import useAppStore from '../store/useAppStore'
import { formatPrice } from '../utils/formatters'
import { generateCouponCode } from '../utils/couponHelpers'
import styles from './Checkout.module.css'

// Resumen del carrito
function StepCart({ items, total, savings, onNext }) {
  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>🛒 Tu Carrito</h2>
      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>No tenés productos en el carrito.</p>
          <Link to="/ofertas" className="btn btn-primary" style={{ marginTop: '1rem' }}>Ver Ofertas →</Link>
        </div>
      ) : (
        <>
          <div className={styles.itemList}>
            {items.map(({ offer }) => (
              <div key={offer.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemCompany}>{offer.company}</span>
                  <span className={styles.itemTitle}>{offer.title}</span>
                </div>
                <div className={styles.itemPrices}>
                  <span className={styles.itemFinal}>{formatPrice(offer.final_price)}</span>
                  <span className={styles.itemOrig}>{formatPrice(offer.original_price)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.summary}>
            <div className={styles.summaryRow}><span>Subtotal</span><span>{formatPrice(total + savings)}</span></div>
            <div className={`${styles.summaryRow} ${styles.discount}`}><span>Descuento</span><span>-{formatPrice(savings)}</span></div>
            <div className={`${styles.summaryRow} ${styles.total}`}><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
          <button className={`btn btn-primary ${styles.nextBtn}`} onClick={onNext}>
            Ir al Pago →
          </button>
        </>
      )}
    </div>
  )
}

// Pago
function StepPayment({ total, onPay, loading }) {
  const [method, setMethod] = useState('card')
  const [form, setForm] = useState({ name: '', number: '', expiry: '', cvv: '' })
  const [error, setError] = useState('')

  const update = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const METHODS = [
    { id: 'card',   icon: '💳', label: 'Tarjeta' },
    { id: 'wallet', icon: '📱', label: 'Wallet Digital' },
    { id: 'crypto', icon: '₿',  label: 'Crypto' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (method === 'card') {
      if (!form.name || !form.number || !form.expiry || !form.cvv)
        return setError('Completá todos los datos de la tarjeta.')
    }
    setError('')
    onPay()
  }

  return (
    <form className={styles.step} onSubmit={handleSubmit}>
      <h2 className={styles.stepTitle}>💳 Método de Pago</h2>

      <div className={styles.methodGrid}>
        {METHODS.map(m => (
          <button
            key={m.id}
            type="button"
            className={`${styles.methodBtn} ${method === m.id ? styles.methodActive : ''}`}
            onClick={() => setMethod(m.id)}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {method === 'card' && (
        <div className={styles.cardForm}>
          <div className="input-group">
            <label>Nombre en la tarjeta</label>
            <input type="text" className="input-field" placeholder="JUAN PÉREZ" value={form.name} onChange={update('name')} />
          </div>
          <div className="input-group">
            <label>Número de tarjeta</label>
            <input type="text" className="input-field" placeholder="0000 0000 0000 0000" maxLength={19} value={form.number} onChange={update('number')} />
          </div>
          <div className={styles.cardRow}>
            <div className="input-group">
              <label>Vencimiento</label>
              <input type="text" className="input-field" placeholder="MM/AA" maxLength={5} value={form.expiry} onChange={update('expiry')} />
            </div>
            <div className="input-group">
              <label>CVV</label>
              <input type="text" className="input-field" placeholder="000" maxLength={4} value={form.cvv} onChange={update('cvv')} />
            </div>
          </div>
        </div>
      )}

      {method !== 'card' && (
        <div className={styles.altMethod}>
          <p>Serás redirigido al proveedor al confirmar.</p>
        </div>
      )}

      {error && <div className={styles.errorMsg}>⚠ {error}</div>}

      <div className={styles.totalRow}>
        <span>Total a pagar</span>
        <span className={styles.totalAmt}>{formatPrice(total)}</span>
      </div>

      <button type="submit" className={`btn btn-primary ${styles.nextBtn}`} disabled={loading}>
        {loading ? 'Procesando...' : 'Confirmar y Pagar →'}
      </button>
      <p className={styles.secure}>🔒 Pago Encriptado SSL</p>
    </form>
  )
}

// Confirmación
function StepConfirm({ codes, txId }) {
  return (
    <div className={`${styles.step} ${styles.confirm}`}>
      <div className={styles.checkIcon}>✓</div>
      <h2 className={styles.confirmTitle}>¡Pago Exitoso!</h2>
      <p className={styles.confirmText}>
        Tu transacción fue procesada correctamente. Ya podés usar tus cupones.
      </p>

      <div className={styles.codesWrap}>
        {codes.map((code, i) => (
          <div key={i} className={styles.codeBox}>
            <span className={styles.codeLabel}>TU CÓDIGO</span>
            <span className={styles.code}>{code}</span>
          </div>
        ))}
      </div>

      <p className={styles.txId}>ID de Transacción: #{txId}</p>

      <Link to="/mis-cupones" className={`btn btn-primary ${styles.nextBtn}`}>
        Ver Mis Cupones →
      </Link>
      <Link to="/" className={`btn btn-outline ${styles.nextBtn}`} style={{ marginTop: '0.5rem' }}>
        Volver al Inicio
      </Link>
    </div>
  )
}

// Página principal 
export default function Checkout() {
  const { items, total, savings, clearCart } = useCart()
  const { user } = useAuth()
  const { addUserCoupon } = useAppStore()
  const [step, setStep] = useState(1)
  const [paying, setPaying] = useState(false)
  const [generatedCodes, setGeneratedCodes] = useState([])
  const [txId] = useState(() => Math.random().toString(36).slice(2, 10).toUpperCase())

  const handlePay = async () => {
    setPaying(true)
    // Simular delay de pago
    await new Promise(r => setTimeout(r, 1800))

    // Generar cupones y agregarlos al store
    const codes = items.map(({ offer }) => {
      const code = generateCouponCode(offer.id)
      addUserCoupon({
        id: `c-${Date.now()}-${offer.id}`,
        offer_id: offer.id,
        code,
        status: 'active',
        company: offer.company,
        title: offer.title,
        category: offer.category,
        expires_at: offer.expires_at,
        purchased_at: new Date().toISOString(),
      })
      return code
    })

    setGeneratedCodes(codes)
    clearCart()
    setPaying(false)
    setStep(3)
  }

  return (
    <main className={styles.main}>
      <div className={`container ${styles.inner}`}>
        {/* Steps indicator */}
        <div className={styles.stepsBar}>
          {[['1', 'Carrito'], ['2', 'Pago'], ['3', 'Confirmación']].map(([n, label]) => (
            <div key={n} className={`${styles.stepIndicator} ${step >= parseInt(n) ? styles.stepDone : ''} ${step === parseInt(n) ? styles.stepCurrent : ''}`}>
              <div className={styles.stepNum}>{n}</div>
              <span className={styles.stepLabel}>{label}</span>
            </div>
          ))}
        </div>

        <div className={styles.card}>
          {step === 1 && <StepCart items={items} total={total} savings={savings} onNext={() => setStep(2)} />}
          {step === 2 && <StepPayment total={total} onPay={handlePay} loading={paying} />}
          {step === 3 && <StepConfirm codes={generatedCodes} txId={txId} />}
        </div>
      </div>
    </main>
  )
}
