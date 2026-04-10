# DescuentoFuture – Estructura del Proyecto React

## Árbol de Carpetas

```
src/
├── main.jsx
├── App.jsx
├── index.css
│
├── context/
│   ├── AuthContext.jsx        ← Estado de autenticación global
│   └── CartContext.jsx        ← Estado del carrito de compras
│
├── store/
│   └── useAppStore.js         ← Zustand: ofertas, filtros, cupones del usuario
│
├── routes/
│   └── PrivateRoute.jsx       ← Protege rutas autenticadas
│
├── pages/
│   ├── Home.jsx               ← Página principal (Hero + Rubros + Ofertas destacadas)
│   ├── Offers.jsx             ← Listado de ofertas con filtros
│   ├── OfferDetail.jsx        ← Detalle de una oferta
│   ├── Auth.jsx               ← Login / Registro / Recuperar contraseña
│   ├── MyCoupons.jsx          ← Cupones del usuario (Activos / Usados / Vencidos)
│   ├── Checkout.jsx           ← Checkout simulado (Carrito → Pago → Confirmación)
│   └── NotFound.jsx           ← 404
│
├── components/
│   ├── layout/
│   │   ├── Header.jsx         ← Header fijo con logo, buscador, filtro, login, mis cupones
│   │   └── Footer.jsx         ← Footer con links legales
│   │
│   ├── home/
│   │   ├── HeroSection.jsx    ← Mensaje promocional + CTA
│   │   ├── CategoryGrid.jsx   ← Grilla de rubros con íconos
│   │   └── FeaturedOffers.jsx ← Grilla de ofertas destacadas
│   │
│   ├── offers/
│   │   ├── OfferCard.jsx      ← Card individual de oferta
│   │   ├── OfferFilters.jsx   ← Panel de filtros (rubro, empresa, descuento)
│   │   └── OfferGrid.jsx      ← Grilla de cards con paginación
│   │
│   ├── coupons/
│   │   ├── CouponCard.jsx     ← Card de cupón (activo/usado/vencido)
│   │   └── CouponModal.jsx    ← Modal con código QR del cupón
│   │
│   ├── checkout/
│   │   ├── CartSummary.jsx    ← Resumen lateral de la compra
│   │   ├── PaymentForm.jsx    ← Formulario de pago
│   │   └── ConfirmationScreen.jsx ← Pantalla de éxito con código único
│   │
│   └── ui/
│       ├── Loader.jsx         ← Spinner de carga
│       ├── EmptyState.jsx     ← Estado vacío amigable
│       └── Badge.jsx          ← Badge de estado (activo/usado/vencido/descuento)
│
└── utils/
│   ├── formatters.js          ← Formateo de precios, fechas, porcentajes
│   ├── couponHelpers.js       ← Lógica de estado de cupones y generación de código
│   └── supabaseClient.js      ← Instancia de Supabase (stub para conectar)
└── App.jsx
└── index.css
│
```

## Flujo de datos

- **AuthContext** → provee `user`, `login()`, `logout()`, `register()`
- **CartContext** → provee `cart`, `addToCart()`, `clearCart()`
- **useAppStore (Zustand)** → `offers`, `filters`, `userCoupons`, acciones de fetch y filtrado

## Rutas (React Router v6)

| Ruta | Componente | Acceso |
|------|------------|--------|
| `/` | Home | Público |
| `/ofertas` | Offers | Público |
| `/ofertas/:id` | OfferDetail | Público |
| `/auth` | Auth | Público (redirige si ya logueado) |
| `/mis-cupones` | MyCoupons | **Privado** |
| `/checkout` | Checkout | **Privado** |
| `*` | NotFound | Público |
