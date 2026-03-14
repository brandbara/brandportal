import { createClient } from '@supabase/supabase-js'

// Intenta leer las claves del archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Si existen las claves, crea el cliente. Si no, devuelve undefined (modo local)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : undefined