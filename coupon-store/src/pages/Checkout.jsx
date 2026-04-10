import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import useAppStore from '../store/useAppStore'
import { formatPrice } from '../utils/formatters'
import styles from './Checkout.module.css'
import { supabase } from '../utils/supabaseClient'
import emailjs from '@emailjs/browser'

// ─── COMPONENTES AUXILIARES ──────────────────────────────────────────

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
                  <span className={styles.itemCompany}>{offer.empresas?.nombre_empresa || 'Empresa'}</span>
                  <span className={styles.itemTitle}>{offer.titulo}</span>
                </div>
                <div className={styles.itemPrices}>
                  {/* Buscamos el precio en varios posibles campos por seguridad */}
                  <span className={styles.itemFinal}>{formatPrice(offer.precio_oferta || offer.final_price || offer.price)}</span>
                  <span className={styles.itemOrig}>{formatPrice(offer.precio_regular || offer.original_price)}</span>
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

// Formulario de Pago
function StepPayment({ total, onPay, loading }) {
  const [method, setMethod] = useState('card')
  const [form, setForm] = useState({ name: '', number: '', expiry: '', cvv: '' })
  const [error, setError] = useState('')

  const update = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

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
      {error && <div className={styles.errorMsg}>⚠ {error}</div>}
      <div className={styles.totalRow}>
        <span>Total a pagar</span>
        <span className={styles.totalAmt}>{formatPrice(total)}</span>
      </div>
      <button type="submit" className={`btn btn-primary ${styles.nextBtn}`} disabled={loading}>
        {loading ? 'Procesando...' : 'Confirmar y Pagar →'}
      </button>
    </form>
  )
}

// Pantalla de Éxito
function StepConfirm({ codes, txId }) {
  return (
    <div className={`${styles.step} ${styles.confirm}`}>
      <div className={styles.checkIcon}>✓</div>
      <h2 className={styles.confirmTitle}>¡Pago Exitoso!</h2>
      <p className={styles.confirmText}>Tu transacción fue procesada. Se ha enviado un correo de confirmación.</p>
      <div className={styles.codesWrap}>
        {codes.map((code, i) => (
          <div key={i} className={styles.codeBox}>
            <span className={styles.codeLabel}>TU CÓDIGO</span>
            <span className={styles.code}>{code}</span>
          </div>
        ))}
      </div>
      <p className={styles.txId}>ID de Transacción: #{txId}</p>
      <Link to="/mis-cupones" className={`btn btn-primary ${styles.nextBtn}`}>Ver Mis Cupones →</Link>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────

export default function Checkout() {
  const { items, total, savings, clearCart } = useCart()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [paying, setPaying] = useState(false)
  const [generatedCodes, setGeneratedCodes] = useState([])
  const [txId] = useState(() => Math.random().toString(36).slice(2, 10).toUpperCase())

  const handlePay = async () => {
    setPaying(true)
    try {
      // 1. Guardamos la Orden en Supabase
      const { data: orden, error: ordenError } = await supabase
        .from('ordenes')
        .insert([{ id_cliente: user.id, total_pagado: total }])
        .select().single()

      if (ordenError) throw ordenError

      const codes = []

      // 2. Procesamos cada producto del carrito
      for (const item of items) {
        const { offer, quantity } = item

        // CORRECCIÓN: Buscamos el precio en varios posibles campos
        const precioUnitario = offer.precio_oferta || offer.final_price || offer.price || 0;

        // Guardamos Detalle de la Orden
        const { data: detalle, error: detalleError } = await supabase
          .from('detalle_orden')
          .insert([{
            id_orden: orden.id,
            id_oferta: offer.id,
            cantidad: quantity,
            precio_unitario: precioUnitario
          }])
          .select().single()

        if (detalleError) throw detalleError

        // 3. Generamos Cupones (Formato Empresa + 7 dígitos)
        for (let i = 0; i < quantity; i++) {
          const empresaCodigo = offer.empresas?.codigo_empresa || 'GEN'
          const numAleatorio = Math.floor(1000000 + Math.random() * 9000000)
          const codigoUnico = `${empresaCodigo}${numAleatorio}`

          const { error: cuponError } = await supabase
            .from('cupones')
            .insert([{
              codigo_unico: codigoUnico,
              id_oferta: offer.id,
              id_cliente: user.id,
              estado_cupon: 'Disponible',
              id_detalle_orden: detalle.id
            }])

          if (cuponError) throw cuponError
          codes.push(codigoUnico)
        }
      }

      // 4. Envío de EmailJS
      const templateParams = {
        to_name: user.user_metadata?.nombres || 'Cliente',
        to_email: user.email,
        order_id: txId,
        total_paid: formatPrice(total),
        coupon_codes: codes.join(', ')
      }

      await emailjs.send(
        'service_f15ltiy',
        'template_hxue9ws',
        templateParams,
        'ftp4H_okMNH98WJgn'
      )
      
      // 5. Finalizar proceso
      setGeneratedCodes(codes)
      clearCart()
      setStep(3)

    } catch (error) {
      console.error('Error en checkout:', error)
      alert('Hubo un error: ' + error.message)
    } finally {
      setPaying(false)
    }
  }

  return (
    <main className={styles.main}>
      <div className={`container ${styles.inner}`}>
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
