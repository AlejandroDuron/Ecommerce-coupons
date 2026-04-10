import { useState } from 'react'
import { Link } from 'react-router-dom'
import emailjs from '@emailjs/browser'
import { useCart, getOfferFinalPrice, getOfferOriginalPrice } from '../../context/cart/CartContext'
import { useAuth } from '../../context/auth/AuthContext'
import { formatPrice } from '../../utils/helpers/formatters'
import useAppStore from '../../store/useAppStore'
import {
  calculateCheckoutTotal,
  createOrderWithCoupons,
  fetchLatestOffersForCheckout,
  updatePurchasedOffersStock,
  validateCheckoutItems,
} from '../../utils/helpers/checkoutHelpers'
import styles from './Checkout.module.css'

function StepPayment({ items, total, onPay, loading, errorMessage }) {
  const [form, setForm] = useState({ name: '', number: '', expiry: '', cvv: '' })
  const [error, setError] = useState('')

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.name || !form.number || !form.expiry || !form.cvv) {
      setError('Completa todos los datos de la tarjeta.')
      return
    }

    setError('')
    onPay()
  }

  return (
    <div className={styles.checkoutLayout}>
      <form className={styles.step} onSubmit={handleSubmit}>
        <div className={styles.stepHeader}>
          <h2 className={styles.stepTitle}>Pago</h2>
          <Link to="/carrito" className={styles.backLink}>Volver al carrito</Link>
        </div>

        <div className={styles.cardForm}>
          <div className="input-group">
            <label>Nombre en la tarjeta</label>
            <input type="text" className="input-field" placeholder="JUAN PEREZ" value={form.name} onChange={update('name')} />
          </div>
          <div className="input-group">
            <label>Numero de tarjeta</label>
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

        {error && <div className={styles.errorMsg}>{error}</div>}
        {errorMessage && <div className={styles.errorMsg}>{errorMessage}</div>}

        <div className={styles.totalRow}>
          <span>Total a pagar</span>
          <span className={styles.totalAmt}>{formatPrice(total)}</span>
        </div>

        <button type="submit" className={`btn btn-primary ${styles.nextBtn}`} disabled={loading}>
          {loading ? 'Procesando...' : 'Confirmar y pagar'}
        </button>
      </form>

      <aside className={styles.orderCard}>
        <h3 className={styles.orderTitle}>Resumen del pedido</h3>
        <div className={styles.itemList}>
          {items.map(({ offer, quantity }) => (
            <div key={offer.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <span className={styles.itemCompany}>{offer.company || offer.empresas?.nombre_empresa || 'Empresa'}</span>
                <span className={styles.itemTitle}>{offer.title || offer.titulo}</span>
                <span className={styles.itemMeta}>Cantidad: {quantity}</span>
              </div>
              <div className={styles.itemPrices}>
                <span className={styles.itemFinal}>{formatPrice(getOfferFinalPrice(offer) * quantity)}</span>
                <span className={styles.itemOrig}>{formatPrice(getOfferOriginalPrice(offer) * quantity)}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}

function StepConfirm({ codes, txId }) {
  return (
    <div className={`${styles.step} ${styles.confirm}`}>
      <div className={styles.checkIcon}>✓</div>
      <h2 className={styles.confirmTitle}>Pago exitoso</h2>
      <p className={styles.confirmText}>Tu transaccion fue procesada y se envio el correo de confirmacion.</p>
      <div className={styles.codesWrap}>
        {codes.map((code) => (
          <div key={code} className={styles.codeBox}>
            <span className={styles.codeLabel}>Tu codigo</span>
            <span className={styles.code}>{code}</span>
          </div>
        ))}
      </div>
      <p className={styles.txId}>ID de transaccion: #{txId}</p>
      <Link to="/mis-cupones" className={`btn btn-primary ${styles.nextBtn}`}>Ver mis cupones</Link>
    </div>
  )
}

export default function Checkout() {
  const { items, total, clearCart, syncOffers } = useCart()
  const { user } = useAuth()
  const { fetchOffers } = useAppStore()
  const [step, setStep] = useState(1)
  const [paying, setPaying] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [generatedCodes, setGeneratedCodes] = useState([])
  const [txId] = useState(() => Math.random().toString(36).slice(2, 10).toUpperCase())

  const handlePay = async () => {
    if (!items.length) {
      setCheckoutError('Tu carrito esta vacio.')
      return
    }

    setPaying(true)
    setCheckoutError('')

    try {
      const latestOffers = await fetchLatestOffersForCheckout(items)
      syncOffers(latestOffers)

      const validatedItems = validateCheckoutItems(items, latestOffers)
      const validatedTotal = calculateCheckoutTotal(validatedItems)
      const { codes } = await createOrderWithCoupons({ items: validatedItems, userId: user.id })

      await emailjs.send(
        'service_f15ltiy',
        'template_hxue9ws',
        {
          to_name: user.user_metadata?.nombres || 'Cliente',
          to_email: user.email,
          order_id: txId,
          total_paid: formatPrice(validatedTotal),
          coupon_codes: codes.join(', '),
        },
        'ftp4H_okMNH98WJgn'
      )

      await updatePurchasedOffersStock(validatedItems)

      setGeneratedCodes(codes)
      clearCart()
      await fetchOffers()
      setStep(2)
    } catch (error) {
      console.error('Error en checkout:', error)
      setCheckoutError(error.message || 'No se pudo completar la compra.')
    } finally {
      setPaying(false)
    }
  }

  if (!items.length && step === 1) {
    return (
      <main className={styles.main}>
        <div className={`container ${styles.inner}`}>
          <div className={styles.card}>
            <div className={styles.empty}>
              <p>No tienes productos en el carrito.</p>
              <Link to="/carrito" className="btn btn-primary">Ir al carrito</Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <div className={`container ${styles.innerWide}`}>
        <div className={styles.stepsBar}>
          {[['1', 'Pago'], ['2', 'Confirmacion']].map(([n, label]) => (
            <div key={n} className={`${styles.stepIndicator} ${step >= Number(n) ? styles.stepDone : ''} ${step === Number(n) ? styles.stepCurrent : ''}`}>
              <div className={styles.stepNum}>{n}</div>
              <span className={styles.stepLabel}>{label}</span>
            </div>
          ))}
        </div>

        <div className={styles.card}>
          {step === 1 && (
            <StepPayment
              items={items}
              total={total}
              onPay={handlePay}
              loading={paying}
              errorMessage={checkoutError}
            />
          )}
          {step === 2 && <StepConfirm codes={generatedCodes} txId={txId} />}
        </div>
      </div>
    </main>
  )
}
