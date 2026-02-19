# ⚡ DescuentoFuture – Tienda de Cupones

Proyecto React para cátedra. UI completa de e-commerce de cupones con diseño futurista minimalista en negro, blanco y verde.

---

## 📁 Árbol de Carpetas

```
descuentofuture/
├── index.html
├── vite.config.js
├── package.json
├── .env.example               ← Copiar como .env con credenciales de Supabase
│
└── src/
    ├── main.jsx               ← Punto de entrada React
    ├── App.jsx                ← Router principal con todas las rutas
    ├── index.css              ← Variables globales, reset, utilidades
    │
    ├── context/
    │   ├── AuthContext.jsx    ← Estado global de autenticación (useReducer)
    │   └── CartContext.jsx    ← Estado global del carrito (useReducer)
    │
    ├── store/
    │   └── useAppStore.js     ← Zustand: ofertas, filtros, cupones del usuario
    │
    ├── routes/
    │   └── PrivateRoute.jsx   ← Protege rutas que requieren login
    │
    ├── pages/
    │   ├── Home.jsx           ← Hero + Rubros + Ofertas destacadas
    │   ├── Offers.jsx         ← Listado con filtros y paginación
    │   ├── OfferDetail.jsx    ← Detalle de oferta + botón comprar
    │   ├── Auth.jsx           ← Login / Registro / Recuperar contraseña
    │   ├── MyCoupons.jsx      ← Cupones del usuario (tabs Activos/Usados/Vencidos)
    │   ├── Checkout.jsx       ← Carrito → Pago → Confirmación con código
    │   └── NotFound.jsx       ← 404
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Header.jsx     ← Header fijo: logo, buscador, categorías, user menu
    │   │   └── Footer.jsx     ← Footer con links
    │   │
    │   ├── home/
    │   │   ├── HeroSection.jsx    ← Sección principal con CTA y animaciones
    │   │   ├── CategoryGrid.jsx   ← Grilla de rubros con íconos
    │   │   └── FeaturedOffers.jsx ← Grilla de ofertas destacadas
    │   │
    │   ├── offers/
    │   │   ├── OfferCard.jsx      ← Card reutilizable de oferta
    │   │   └── OfferFilters.jsx   ← Panel de filtros (categoría, descuento, orden)
    │   │
    │   ├── coupons/
    │   │   ├── CouponCard.jsx     ← Card de cupón con estado visual
    │   │   └── CouponModal.jsx    ← Modal con código QR simulado
    │   │
    │   └── ui/
    │       ├── Loader.jsx         ← Spinner (inline y fullscreen)
    │       ├── EmptyState.jsx     ← Estado vacío amigable
    │       └── Badge.jsx          ← Badges: activo / usado / vencido / descuento
    │
    └── utils/
        ├── supabaseClient.js  ← Cliente Supabase (configurar con .env)
        ├── formatters.js      ← Precio, fecha, días hasta vencimiento
        └── couponHelpers.js   ← Estado de cupones, generación de código
```

---

## 🗺️ Rutas

| Ruta | Página | Acceso |
|------|--------|--------|
| `/` | Home | Público |
| `/ofertas` | Listado de ofertas | Público |
| `/ofertas/:id` | Detalle de oferta | Público |
| `/auth` | Login / Registro | Público |
| `/mis-cupones` | Cupones del usuario | **Privado** |
| `/checkout` | Checkout | **Privado** |

---

## 🧠 Flujo de Estado

### AuthContext (useReducer)
- **state:** `{ user, loading, error }`
- **acciones:** `login()`, `register()`, `logout()`, `resetPassword()`
- Se conecta con `supabase.auth` y escucha cambios de sesión con `onAuthStateChange`

### CartContext (useReducer)
- **state:** `{ items }`
- **acciones:** `addToCart(offer)`, `removeFromCart(offerId)`, `clearCart()`
- Computed: `total`, `savings`

### useAppStore (Zustand)
- **state:** `offers`, `userCoupons`, `categories`, `filters`, `loading`
- **acciones:** `fetchOffers()`, `fetchUserCoupons(userId)`, `addUserCoupon(coupon)`, `setFilter(key, value)`, `clearFilters()`
- **computed:** `getFilteredOffers()`, `getFeaturedOffers()`, `getOfferById(id)`

---

## 🔌 Conexión con Supabase

El archivo `src/utils/supabaseClient.js` crea el cliente usando variables de entorno.

### Configuración:
1. Copiar `.env.example` a `.env`
2. Completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

### Tablas esperadas en Supabase:

**`offers`**
```sql
id           uuid PRIMARY KEY
title        text
company      text
category     text  -- 'Gastronomía' | 'Bienestar' | 'Tecnología' | 'Viajes' | 'Moda'
discount_pct integer
original_price decimal
final_price  decimal
image_url    text (nullable)
description  text
conditions   text[] (array)
expires_at   timestamptz
featured     boolean default false
approved     boolean default false
rating       decimal (nullable)
created_at   timestamptz default now()
```

**`user_coupons`**
```sql
id           uuid PRIMARY KEY
user_id      uuid REFERENCES auth.users
offer_id     uuid REFERENCES offers
code         text UNIQUE
status       text  -- 'active' | 'used' | 'expired'
purchased_at timestamptz default now()
expires_at   timestamptz
```

> **Sin backend configurado:** El proyecto incluye datos mock en `useAppStore.js` para que la UI funcione completamente sin Supabase. Al conectar el backend real, los datos mock se reemplazan automáticamente.

---

## 🚀 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar Supabase (opcional para UI)
cp .env.example .env
# Editar .env con tus credenciales

# 3. Iniciar desarrollo
npm run dev

# 4. Build producción
npm run build
```

---

## 📦 Dependencias

| Paquete | Uso |
|---------|-----|
| `react` + `react-dom` | Framework base |
| `react-router-dom` v6 | Navegación entre páginas |
| `zustand` | Estado global de ofertas y cupones |
| `@supabase/supabase-js` | Cliente para autenticación y base de datos |
| `vite` | Bundler y servidor de desarrollo |

---

## 🎨 Diseño

- **Colores:** Negro `#0a0a0a`, Verde lima `#b6f542`, Blanco `#f0f0f0`
- **Tipografías:** Syne (display/títulos), Space Mono (código/labels)
- **Responsive:** Mobile-first con breakpoints en `640px`, `768px`, `1024px`
- **CSS:** CSS Modules por componente + variables globales en `index.css`
