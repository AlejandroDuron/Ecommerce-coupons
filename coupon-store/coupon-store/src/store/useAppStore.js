// store/useAppStore.js
import { create } from 'zustand'
import { supabase } from '../utils/supabaseClient'

// Store 
const useAppStore = create((set, get) => ({
  // State 
  offers: [],
  userCoupons: [],
  categories: [],
  loading: false,
  error: null,

  filters: {
    search: '',
    category: '',
    minDiscount: 0,
    sortBy: 'featured',  // 'featured' | 'discount' | 'price_asc' | 'newest'
  },

  // Fetch Categories 
  fetchCategories: async () => {
    set({ loading: true, error: null })

    try {
      const { data, error } = await supabase
        .from('rubros')
        .select('nombre_rubro')
        .limit(5)

      if (error) throw error

      set({ headerCategories: data, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
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
          stock,
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
        available: oferta.stock,
        featured: true, // Podríamos agregar un campo en la BD para esto, por ahora lo dejamos así
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
      case 'discount': result.sort((a, b) => b.discount_pct - a.discount_pct); break
      case 'price_asc': result.sort((a, b) => a.final_price - b.final_price); break
      case 'newest': result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)); break
      default: result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break
    }
    return result
  },

  getFeaturedOffers: () => get().offers.filter(o => o.featured).slice(0, 3),

  getOfferById: (id) => get().offers.find(o => String(o.id) === String(id)),
}))

export default useAppStore
