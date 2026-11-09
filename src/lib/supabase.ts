import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Only the public project URL and anon/publishable key belong in the browser.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
// Accepts either name: Supabase now calls this the "publishable" key, older docs say "anon".
const anonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null
