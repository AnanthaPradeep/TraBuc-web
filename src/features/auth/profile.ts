import type { SupabaseClient, User } from '@supabase/supabase-js'

export interface Profile { id: string; full_name: string | null; created_at: string }

export async function fetchProfile(client: Pick<SupabaseClient, 'from'>, userId: string): Promise<Profile | null> {
  const { data, error } = await client.from('profiles').select('id, full_name, created_at').eq('id', userId).maybeSingle()
  if (error) throw new Error(error.message)
  return (data as Profile | null) ?? null
}

/** Name from the profiles table first, then sign-up metadata, else null. */
export function resolveName(profile: Profile | null, user: User | null): string | null {
  const fromProfile = profile?.full_name?.trim()
  if (fromProfile) return fromProfile
  const meta = user?.user_metadata?.full_name
  return typeof meta === 'string' && meta.trim() ? meta.trim() : null
}
