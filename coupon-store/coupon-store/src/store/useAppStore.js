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

  //  Fetch Ofertas 
  fetchOffers: async () => {
    set({ loading: true, error: null });
    try {
      // Hacemos la consulta a la tabla 'ofertas' y traemos la información de la empresa y el rubro
      const { data, error } = await supabase
        .from('ofertas')
        .select(`
          id,
          titulo,
          descripcion,
          precio_regular,
          precio_oferta,
          fecha_fin,
          cantidad_limite,
          image_url,
          empresas (
            nombre_empresa,
            rubros (
              nombre_rubro
            )
          )
        `)
        .eq('estado', 'Oferta aprobada');

      if (error) throw error;

      // Mapeamos los datos para que el Frontend los entienda con la misma estructura
      // pero usando los datos reales de la BD
      const formattedOffers = data.map(oferta => ({
        id: oferta.id,
        title: oferta.titulo,
        company: oferta.empresas?.nombre_empresa || 'Empresa Desconocida',
        category: oferta.empresas?.rubros?.nombre_rubro || 'General',
        discount_pct: Math.round((1 - (oferta.precio_oferta / oferta.precio_regular)) * 100),
        original_price: oferta.precio_regular,
        final_price: oferta.precio_oferta,
        image_url: oferta.image_url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80', 
        description: oferta.descripcion,
        expires_at: oferta.fecha_fin,
        featured: false,
      }));

      // set({ offers: formattedOffers, loading: false });
      const uniqueCategories = [...new Set(formattedOffers.map(o => o.category).filter(Boolean))]
      set({ offers: formattedOffers, categories: uniqueCategories, loading: false })

    } catch (error) {
      console.error('Error fetching offers:', error);
      set({ error: error.message, loading: false });
    }
},

  //Fetch Cupones del usuario
  fetchUserCoupons: async (userId) => {
    set({ loading: true, error: null })
    try {
      // Consultamos la tabla 'cupones', trayendo la información de la oferta y la empresa
      const { data, error } = await supabase
        .from('cupones')
        .select(`
          codigo_unico,
          estado_cupon,
          fecha_compra,
          fecha_canje,
          ofertas (
            id,
            titulo,
            empresas (
              nombre_empresa,
              rubros ( nombre_rubro )
            )
          )
        `)
        .eq('id_cliente', userId) // Filtramos por el ID del usuario logueado

      if (error) throw error;

      // Mapeamos los datos al formato que espera el frontend
      const formattedCoupons = data.map(cupon => ({
        id: cupon.codigo_unico, // Usamos el código único como ID principal
        code: cupon.codigo_unico,
        status: cupon.estado_cupon === 'Disponible' ? 'active' : 
                cupon.estado_cupon === 'Canjeado' ? 'used' : 'expired',
        title: cupon.ofertas?.titulo || 'Oferta Desconocida',
        company: cupon.ofertas?.empresas?.nombre_empresa || 'Empresa Desconocida',
        category: cupon.ofertas?.empresas?.rubros?.nombre_rubro || 'General',
        purchased_at: cupon.fecha_compra,
        // En la BD el cupón no tiene fecha de expiración, so la omitimos o 
        // podríamos traerla de la oferta. Por ahora, lo dejaremos asi.
      }));

      set({ userCoupons: formattedCoupons, loading: false })
      
    } catch (error) {
      console.error('Error fetching user coupons:', error);
      // Si falla, ya NO mostramos los mocks, mostramos vacío o el error real
      set({ userCoupons: [], error: error.message, loading: false })
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

  getOfferById: (id) => get().offers.find(o => String(o.id) === String(id)),
}))

export default useAppStore
