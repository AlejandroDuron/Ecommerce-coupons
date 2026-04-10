import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { useCart, getOfferMaxQuantity, getOfferFinalPrice, getOfferOriginalPrice } from '../../context/cart/CartContext'
import { useAuth } from '../../context/auth/AuthContext'
import { formatPrice } from '../../utils/helpers/formatters'
import styles from './Cart.module.css'

export default function Cart() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    items,
    itemCount,
    subtotal,
    total,
    savings,
    incrementItem,
    decrementItem,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart()

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Tu seleccion</p>
            <h1 className={styles.title}>Carrito de cupones</h1>
            <p className={styles.subtitle}>
              Revisa tus cupones antes de continuar al pago. Puedes ajustar cantidades sin salir de esta vista.
            </p>
          </div>
          {items.length > 0 && (
            <button className="btn btn-ghost" onClick={clearCart}>
              <Trash2 size={14} /> Vaciar carrito
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <section className={`card ${styles.emptyCard}`}>
            <div className={styles.emptyIcon}>
              <ShoppingCart size={32} />
            </div>
            <h2>Tu carrito esta vacio</h2>
            <p>Agrega cupones desde las ofertas para preparar tu compra.</p>
            <Link to="/ofertas" className="btn btn-primary">
              Ver ofertas <ArrowRight size={14} />
            </Link>
          </section>
        ) : (
          <div className={styles.layout}>
            <section className={`card ${styles.listCard}`}>
              <div className={styles.cardHead}>
                <div>
                  <h2 className={styles.sectionTitle}>Cupones agregados</h2>
                  <p className={styles.sectionMeta}>{itemCount} item{itemCount === 1 ? '' : 's'} en tu carrito</p>
                </div>
              </div>

              <div className={styles.items}>
                {items.map(({ offer, quantity }) => {
                  const maxQuantity = getOfferMaxQuantity(offer)
                  const finalPrice = getOfferFinalPrice(offer)
                  const originalPrice = getOfferOriginalPrice(offer)

                  return (
                    <article key={offer.id} className={styles.item}>
                      <div className={styles.itemInfo}>
                        <span className={styles.company}>{offer.company}</span>
                        <h3 className={styles.itemTitle}>{offer.title}</h3>
                        <p className={styles.stock}>
                          Disponibles: {offer.stock ?? offer.available ?? 0}
                          {offer.cantidad_limite != null ? ` · Limite por compra: ${offer.cantidad_limite}` : ''}
                        </p>
                        <button className={styles.removeBtn} onClick={() => removeFromCart(offer.id)}>
                          Quitar
                        </button>
                      </div>

                      <div className={styles.itemControls}>
                        <div className={styles.priceBlock}>
                          <span className={styles.finalPrice}>{formatPrice(finalPrice)}</span>
                          <span className={styles.originalPrice}>{formatPrice(originalPrice)}</span>
                        </div>

                        <div className={styles.quantityWrap}>
                          <button
                            className={styles.qtyBtn}
                            onClick={() => decrementItem(offer.id)}
                            aria-label={`Disminuir cantidad de ${offer.title}`}
                            disabled={quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>

                          <input
                            type="number"
                            min="1"
                            max={maxQuantity}
                            value={quantity}
                            className={styles.qtyInput}
                            onChange={(event) => updateQuantity(offer.id, event.target.value)}
                          />

                          <button
                            className={styles.qtyBtn}
                            onClick={() => incrementItem(offer.id)}
                            aria-label={`Aumentar cantidad de ${offer.title}`}
                            disabled={quantity >= maxQuantity}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <span className={styles.lineTotal}>{formatPrice(finalPrice * quantity)}</span>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>

            <aside className={`card ${styles.summaryCard}`}>
              <div className={styles.summaryHead}>
                <h2 className={styles.sectionTitle}>Resumen</h2>
                <p className={styles.sectionMeta}>Listo para el checkout</p>
              </div>

              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Descuento</span>
                  <span className={styles.savings}>-{formatPrice(savings)}</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button className={`btn btn-primary ${styles.checkoutBtn}`} onClick={() => navigate('/checkout')}>
                Continuar al checkout <ArrowRight size={14} />
              </button>

              {!user && (
                <p className={styles.authNote}>
                  Al continuar se te pedira iniciar sesion antes de completar la compra.
                </p>
              )}

              <Link to="/ofertas" className={`btn btn-outline ${styles.secondaryBtn}`}>
                Seguir explorando
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
