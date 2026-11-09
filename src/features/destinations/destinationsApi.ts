import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { Budget, Destination, DestinationType } from './types'

export interface DestinationRow {
  slug: string
  name: string
  country: string
  type: DestinationType
  kind: 'popular' | 'hidden'
  budget: Budget
  best_months: number[]
  lat: number
  lng: number
  elevation: number
  summary: string
  highlights: string[]
  image_url: string | null
  image_credit: string | null
  image_license: string | null
  verified: boolean
}

const COLUMNS = 'slug, name, country, type, kind, budget, best_months, lat, lng, elevation, summary, highlights, image_url, image_credit, image_license, verified'

/** Stable number from the slug, used to seed the generated fallback artwork. */
export function artSeedFor(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 1000
  return h + 1
}

function clean(s: string | null | undefined): string | undefined {
  const t = s?.trim()
  return t ? t : undefined
}

/** Only web URLs are used as images; anything else falls back to generated artwork. */
function cleanImageUrl(s: string | null | undefined): string | undefined {
  const t = clean(s)
  return t && /^https?:\/\//i.test(t) ? t : undefined
}

export function rowToDestination(r: DestinationRow): Destination {
  return {
    slug: r.slug,
    name: r.name,
    country: r.country,
    type: r.type,
    kind: r.kind,
    budget: r.budget,
    bestMonths: [...(r.best_months ?? [])],
    lat: r.lat,
    lng: r.lng,
    elevation: r.elevation ?? 0,
    summary: r.summary,
    highlights: [...(r.highlights ?? [])],
    image: cleanImageUrl(r.image_url),
    imageCredit: clean(r.image_credit),
    imageLicense: clean(r.image_license),
    verified: r.verified === true,
    artSeed: artSeedFor(r.slug),
  }
}

type Client = Pick<SupabaseClient, 'from'>

function need(client: Client | null): Client {
  if (!client) throw new Error('Supabase is not configured.')
  return client
}

export async function listDestinations(client: Client | null = supabase): Promise<Destination[]> {
  const { data, error } = await need(client).from('destinations').select(COLUMNS).order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return ((data ?? []) as DestinationRow[]).map(rowToDestination)
}

export async function getDestinationBySlug(slug: string, client: Client | null = supabase): Promise<Destination | null> {
  const { data, error } = await need(client).from('destinations').select(COLUMNS).eq('slug', slug).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? rowToDestination(data as DestinationRow) : null
}
