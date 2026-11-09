import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import * as api from './memoriesApi'
import type { Memory } from './memoriesApi'
import type { MemoryValues } from './validation'

interface Loaded { key: string; memories: Memory[]; error: string | null }

export interface PhotoChange { file: File | null; removePhoto: boolean }

export interface MemoriesState {
  /** True only when Supabase is configured and a user is signed in. Otherwise nothing is loaded or saved. */
  enabled: boolean
  loading: boolean
  error: string | null
  memories: Memory[]
  retry: () => void
  add: (v: MemoryValues, file: File | null) => Promise<Memory>
  update: (m: Memory, v: MemoryValues, photo: PhotoChange) => Promise<string | null>
  /** Resolves to a warning when the memory was deleted but its photo file could not be. */
  remove: (m: Memory) => Promise<string | null>
}

const ORPHAN_WARNING = 'The memory was saved, but the old photo file could not be removed from storage.'

export function useMemories(): MemoriesState {
  const { configured, user } = useAuth()
  const userId = user?.id
  const enabled = configured && Boolean(userId)
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const key = `${userId ?? ''}:${attempt}`

  useEffect(() => {
    if (!enabled) return
    let active = true
    api.listMemories()
      .then((memories) => { if (active) setLoaded({ key, memories, error: null }) })
      .catch((e: unknown) => { if (active) setLoaded({ key, memories: [], error: e instanceof Error ? e.message : 'Could not load your memories.' }) })
    return () => { active = false }
  }, [enabled, key])

  const current = enabled && loaded?.key === key ? loaded : null
  const loading = enabled && !current
  const error = current?.error ?? null
  const currentMemories = current?.memories
  const memories = useMemo(() => currentMemories ?? [], [currentMemories])

  const retry = useCallback(() => setAttempt((a) => a + 1), [])
  const mutate = useCallback((fn: (m: Memory[]) => Memory[]) => {
    setLoaded((l) => (l ? { ...l, memories: fn(l.memories) } : l))
  }, [])

  const add = useCallback<MemoriesState['add']>(async (v, file) => {
    if (!enabled || !userId) throw new Error('Sign in to save memories.')
    const path = file ? await api.uploadPhoto(userId, file) : null
    try {
      const created = await api.createMemory(v, path)
      mutate((m) => [created, ...m])
      return created
    } catch (e) {
      if (path) await api.deletePhoto(path).catch(() => undefined) // do not leave an unreferenced upload behind
      throw e
    }
  }, [enabled, userId, mutate])

  const update = useCallback<MemoriesState['update']>(async (m, v, { file, removePhoto }) => {
    if (!enabled || !userId) throw new Error('Sign in to save memories.')
    const newPath = file ? await api.uploadPhoto(userId, file) : removePhoto ? null : undefined
    let saved: Memory
    try {
      saved = await api.updateMemory(m.id, v, newPath)
    } catch (e) {
      if (file && newPath) await api.deletePhoto(newPath).catch(() => undefined)
      throw e
    }
    mutate((list) => list.map((x) => (x.id === m.id ? saved : x)))
    if (newPath !== undefined && m.photoPath) {
      try { await api.deletePhoto(m.photoPath) } catch { return ORPHAN_WARNING }
    }
    return null
  }, [enabled, userId, mutate])

  const remove = useCallback<MemoriesState['remove']>(async (m) => {
    if (!enabled) throw new Error('Sign in to manage memories.')
    await api.removeMemory(m.id)
    mutate((list) => list.filter((x) => x.id !== m.id))
    if (m.photoPath) {
      try { await api.deletePhoto(m.photoPath) } catch { return 'The memory was deleted, but its photo file could not be removed from storage.' }
    }
    return null
  }, [enabled, mutate])

  return { enabled, loading, error, memories, retry, add, update, remove }
}
