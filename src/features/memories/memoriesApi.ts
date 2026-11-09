import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { BUCKET, buildPhotoPath, validatePhoto, type MemoryValues } from './validation'

export interface Memory {
  id: string
  title: string
  note: string
  photoPath?: string
  takenOn?: string
  tripId?: string
  createdAt: string
}

export interface MemoryRow {
  id: string
  title: string
  note: string
  photo_path: string | null
  taken_on: string | null
  trip_id: string | null
  created_at: string
}

const COLUMNS = 'id, title, note, photo_path, taken_on, trip_id, created_at'

export function rowToMemory(r: MemoryRow): Memory {
  return {
    id: r.id,
    title: r.title,
    note: r.note ?? '',
    photoPath: r.photo_path || undefined,
    takenOn: r.taken_on || undefined,
    tripId: r.trip_id || undefined,
    createdAt: r.created_at,
  }
}

/**
 * Editable columns only: user_id is never sent (the database fills it from the session).
 * photoPath: undefined = leave the photo unchanged, null = remove it, string = set it.
 */
export function valuesToPayload(v: MemoryValues, photoPath?: string | null) {
  const payload: Record<string, string | null> = {
    title: v.title.trim(),
    note: v.note.trim(),
    taken_on: v.takenOn || null,
    trip_id: v.tripId || null,
  }
  if (photoPath !== undefined) payload.photo_path = photoPath
  return payload
}

type Client = Pick<SupabaseClient, 'from' | 'storage'>

function need(client: Client | null): Client {
  if (!client) throw new Error('Memories are not available: Supabase is not configured.')
  return client
}

export async function listMemories(client: Client | null = supabase): Promise<Memory[]> {
  const { data, error } = await need(client).from('memories').select(COLUMNS).order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return ((data ?? []) as MemoryRow[]).map(rowToMemory)
}

export async function createMemory(v: MemoryValues, photoPath: string | null, client: Client | null = supabase): Promise<Memory> {
  const { data, error } = await need(client).from('memories').insert(valuesToPayload(v, photoPath)).select(COLUMNS).single()
  if (error) throw new Error(error.message)
  return rowToMemory(data as MemoryRow)
}

export async function updateMemory(id: string, v: MemoryValues, photoPath: string | null | undefined, client: Client | null = supabase): Promise<Memory> {
  const { data, error } = await need(client).from('memories').update(valuesToPayload(v, photoPath)).eq('id', id).select(COLUMNS).single()
  if (error) throw new Error(error.message)
  return rowToMemory(data as MemoryRow)
}

export async function removeMemory(id: string, client: Client | null = supabase): Promise<void> {
  const { error } = await need(client).from('memories').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** Uploads to {userId}/{uuid}.{ext} in the private bucket and returns the storage path. */
export async function uploadPhoto(userId: string, file: File, client: Client | null = supabase): Promise<string> {
  const problem = validatePhoto(file)
  if (problem) throw new Error(problem)
  const path = buildPhotoPath(userId, file.type)
  const { error } = await need(client).storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw new Error(error.message)
  return path
}

export async function deletePhoto(path: string, client: Client | null = supabase): Promise<void> {
  const { error } = await need(client).storage.from(BUCKET).remove([path])
  if (error) throw new Error(error.message)
}

/** Short-lived signed URL. The bucket is private, so public URLs are never used. */
export async function getSignedUrl(path: string, expiresInSeconds = 600, client: Client | null = supabase): Promise<string> {
  const { data, error } = await need(client).storage.from(BUCKET).createSignedUrl(path, expiresInSeconds)
  if (error || !data?.signedUrl) throw new Error(error?.message ?? 'Could not load the photo.')
  return data.signedUrl
}
