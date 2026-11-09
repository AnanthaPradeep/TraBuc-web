import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { TripFormValues } from './dates'
import type { Trip } from './types'

export interface TripRow {
  id: string
  title: string
  destination_slug: string
  start_date: string
  end_date: string
  notes: string
  created_at?: string
  updated_at?: string
}

const COLUMNS = 'id, title, destination_slug, start_date, end_date, notes, created_at, updated_at'

export function rowToTrip(r: TripRow): Trip {
  return { id: r.id, title: r.title, destinationSlug: r.destination_slug, startDate: r.start_date, endDate: r.end_date, notes: r.notes ?? '' }
}

/** Editable columns only. user_id is never sent: the database fills it from the session. */
export function valuesToPayload(v: TripFormValues) {
  return { title: v.title.trim(), destination_slug: v.destinationSlug, start_date: v.startDate, end_date: v.endDate, notes: v.notes.trim() }
}

type Client = Pick<SupabaseClient, 'from'>

function need(client: Client | null): Client {
  if (!client) throw new Error('Saving trips is not available: Supabase is not configured.')
  return client
}

export async function listTrips(client: Client | null = supabase): Promise<Trip[]> {
  const { data, error } = await need(client).from('trips').select(COLUMNS).order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return ((data ?? []) as TripRow[]).map(rowToTrip)
}

export async function createTrip(v: TripFormValues, client: Client | null = supabase): Promise<Trip> {
  const { data, error } = await need(client).from('trips').insert(valuesToPayload(v)).select(COLUMNS).single()
  if (error) throw new Error(error.message)
  return rowToTrip(data as TripRow)
}

export async function updateTrip(id: string, v: TripFormValues, client: Client | null = supabase): Promise<Trip> {
  const { data, error } = await need(client).from('trips').update(valuesToPayload(v)).eq('id', id).select(COLUMNS).single()
  if (error) throw new Error(error.message)
  return rowToTrip(data as TripRow)
}

export async function removeTrip(id: string, client: Client | null = supabase): Promise<void> {
  const { error } = await need(client).from('trips').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
