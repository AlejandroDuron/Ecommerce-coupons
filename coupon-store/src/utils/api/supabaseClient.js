// utils/supabaseClient.js
// ─────────────────────────────────────────────────────────────────────────────
// Stub del cliente de Supabase.
// El equipo de backend deberá reemplazar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
// en el archivo .env con los valores reales del proyecto.
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || 'https://placeholder.supabase.co'
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Tabla esperada: offers ────────────────────────────────
// id, title, company, category, discount_pct, original_price,
// final_price, image_url, description, conditions, expires_at, featured

// ── Tabla esperada: user_coupons ─────────────────────────
// id, user_id, offer_id, code, status (active|used|expired),
// purchased_at, expires_at
