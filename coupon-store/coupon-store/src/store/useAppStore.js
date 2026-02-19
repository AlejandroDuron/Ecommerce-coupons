// store/useAppStore.js
import { create } from 'zustand'
import { supabase } from '../utils/supabaseClient'

//Datos mock para desarrollo UI
const MOCK_OFFERS = [
  { id: 1, title: 'Combo Premium Omakase para dos', company: 'Sushi Master Gourmet', category: 'Gastronomía', discount_pct: 50, original_price: 30, final_price: 15, image_url: null, description: 'Sumérgete en una experiencia sensorial inigualable. Nuestro chef ha diseñado una selección de 30 piezas...', conditions: ['Válido de lunes a jueves', 'Reserva previa 24hs', 'Presentar cupón al llegar'], expires_at: new Date(Date.now() + 2 * 86400000).toISOString(), featured: true, rating: 4.8 },
  { id: 2, title: 'Regeneración celular con tecnología LED', company: 'Cyber Spa', category: 'Bienestar', discount_pct: 30, original_price: 120, final_price: 84, image_url: null, description: 'Sesión completa de fototerapia LED para rejuvenecimiento celular.', conditions: ['Válido L-V', 'Con turno previo'], expires_at: new Date(Date.now() + 10 * 86400000).toISOString(), featured: true, rating: 4.9 },
  { id: 3, title: 'Auriculares Wireless Noise Cancelling Pro', company: 'Neo Audio', category: 'Tecnología', discount_pct: 15, original_price: 250, final_price: 212.5, image_url: null, description: 'Cancelación de ruido cuántica para máxima inmersión.', conditions: ['Stock limitado', 'No acumulable'], expires_at: new Date(Date.now() + 31 * 86400000).toISOString(), featured: true, rating: 4.5 },
  { id: 4, title: 'Potencia extrema para desarrollo', company: 'Void Computing', category: 'Tecnología', discount_pct: 20, original_price: 500, final_price: 400, image_url: null, description: 'Workstation de alto rendimiento para desarrolladores.', conditions: ['Solo online', 'Envío incluido'], expires_at: new Date(Date.now() + 7 * 86400000).toISOString(), featured: true, rating: 5.0 },
  { id: 5, title: 'Inmersión total en mundos paralelos', company: 'VR Center', category: 'Tecnología', discount_pct: 40, original_price: 80, final_price: 48, image_url: null, description: 'Sesión de realidad virtual de 2 horas con equipos de última generación.', conditions: ['Mayores de 14', 'Con turno'], expires_at: new Date(Date.now() + 14 * 86400000).toISOString(), featured: true, rating: 4.7 },
  { id: 6, title: 'Menú Degustación Signature para Dos', company: 'SushiKo Premium', category: 'Gastronomía', discount_pct: 40, original_price: 85, final_price: 49.99, image_url: null, description: 'Barra de sushi premium con ingredientes importados.', conditions: ['Solo fines de semana', 'Sin consumo mínimo'], expires_at: new Date(Date.now() + 3 * 86400000).toISOString(), featured: false, rating: 4.8 },
  { id: 7, title: 'Zapatillas de Alto Rendimiento Next-Gen', company: 'Sport Pro', category: 'Moda', discount_pct: 50, original_price: 120, final_price: 60, image_url: null, description: 'Tecnología de amortiguación avanzada para corredores.', conditions: ['Última unidad', 'Sin devolución'], expires_at: new Date(Date.now() + 1 * 86400000).toISOString(), featured: false, rating: 4.6 },
  { id: 8, title: 'Sesión Spa de Lujo con Masaje Volcánico', company: 'Wellness Center', category: 'Bienestar', discount_pct: 40, original_price: 75, final_price: 45, image_url: null, description: 'Masaje con piedras volcánicas y aromaterapia incluida.', conditions: ['Solo turnos tarde', 'Reserva obligatoria'], expires_at: new Date(Date.now() + 15 * 86400000).toISOString(), featured: false, rating: 4.9 },
]

const MOCK_USER_COUPONS = [
  { id: 'c1', offer_id: 6, code: 'COFFEE24', status: 'active', company: 'SushiKo Premium', title: 'Menú Degustación', category: 'Gastronomía', expires_at: new Date(Date.now() + 2 * 3600000).toISOString(), purchased_at: new Date().toISOString() },
  { id: 'c2', offer_id: 7, code: 'NIKE30OFF', status: 'active', company: 'Sport Pro', title: 'Zapatillas Next-Gen', category: 'Moda', expires_at: new Date(Date.now() + 4 * 86400000).toISOString(), purchased_at: new Date().toISOString() },
  { id: 'c3', offer_id: 1, code: 'SUSHI50AB', status: 'used', company: 'Sushi Master', title: 'Combo Omakase', category: 'Gastronomía', expires_at: new Date(Date.now() - 5 * 86400000).toISOString(), purchased_at: new Date().toISOString() },
  { id: 'c4', offer_id: 2, code: 'SPA30CD', status: 'expired', company: 'Cyber Spa', title: 'Sesión LED', category: 'Bienestar', expires_at: new Date(Date.now() - 10 * 86400000).toISOString(), purchased_at: new Date().toISOString() },
]

const CATEGORIES = ['Gastronomía', 'Bienestar', 'Tecnología', 'Viajes', 'Moda']

// Store 
const useAppStore = create((set, get) => ({
  // State 
  offers:       [],
  userCoupons:  [],
  categories:   CATEGORIES,
  loading:      false,
  error:        null,

  filters: {
    search:      '',
    category:    '',
    minDiscount: 0,
    sortBy:      'featured',  // 'featured' | 'discount' | 'price_asc' | 'newest'
  },

  //  Fetch Ofertas (Supabase o Mock) 
  fetchOffers: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('approved', true)
        .gte('expires_at', new Date().toISOString())

      // Si Supabase no está configurado (para mientras eh) usar mock
      if (error || !data?.length) {
        set({ offers: MOCK_OFFERS, loading: false })
      } else {
        set({ offers: data, loading: false })
      }
    } catch {
      set({ offers: MOCK_OFFERS, loading: false })
    }
  },

  // ── Fetch Cupones del usuario ──────────────────────────
  fetchUserCoupons: async (userId) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('user_coupons')
        .select('*, offers(*)')
        .eq('user_id', userId)

      if (error || !data?.length) {
        set({ userCoupons: MOCK_USER_COUPONS, loading: false })
      } else {
        set({ userCoupons: data, loading: false })
      }
    } catch {
      set({ userCoupons: MOCK_USER_COUPONS, loading: false })
    }
  },

  // ── Agregar cupón tras compra ──────────────────────────
  addUserCoupon: (coupon) =>
    set((state) => ({ userCoupons: [coupon, ...state.userCoupons] })),

  // ── Filtros ───────────────────────────────────────────
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  clearFilters: () =>
    set({ filters: { search: '', category: '', minDiscount: 0, sortBy: 'featured' } }),

  // ── Ofertas filtradas (computed) ───────────────────────
  getFilteredOffers: () => {
    const { offers, filters } = get()
    let result = [...offers]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        o => o.title.toLowerCase().includes(q) || o.company.toLowerCase().includes(q)
      )
    }
    if (filters.category) {
      result = result.filter(o => o.category === filters.category)
    }
    if (filters.minDiscount > 0) {
      result = result.filter(o => o.discount_pct >= filters.minDiscount)
    }
    switch (filters.sortBy) {
      case 'discount':  result.sort((a, b) => b.discount_pct - a.discount_pct); break
      case 'price_asc': result.sort((a, b) => a.final_price - b.final_price); break
      case 'newest':    result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)); break
      default:          result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break
    }
    return result
  },

  getFeaturedOffers: () => get().offers.filter(o => o.featured),

  getOfferById: (id) => get().offers.find(o => o.id === parseInt(id)),
}))

export default useAppStore
