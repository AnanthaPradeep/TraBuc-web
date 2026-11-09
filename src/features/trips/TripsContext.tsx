import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Trip } from './types'
import type { TripFormValues } from './dates'
import { sampleTrips } from './sample'
import { useAuth } from '../auth/useAuth'
import * as api from './tripsApi'

export interface TripsValue {
  trips: Trip[]
  /** True when trips are loaded from and saved to the user's Supabase account. */
  persisted: boolean
  loading: boolean
  error: string | null
  retry: () => void
  addTrip: (v: TripFormValues) => Promise<Trip>
  updateTrip: (id: string, v: TripFormValues) => Promise<Trip>
  removeTrip: (id: string) => Promise<void>
  getTrip: (id: string) => Trip | undefined
}

const TripsContext = createContext<TripsValue | null>(null)

interface Loaded { key: string; trips: Trip[]; error: string | null }

/**
 * Signed in and Supabase configured: trips are stored per user in Supabase.
 * Otherwise: in memory only, with sample trips. Nothing is written to the database.
 */
export function TripsProvider({ children }: { children: ReactNode }) {
  const { configured, loading: authLoading, user } = useAuth()
  const userId = user?.id
  const persisted = configured && Boolean(userId)

  const [localTrips, setLocalTrips] = useState<Trip[]>(sampleTrips)
  const [attempt, setAttempt] = useState(0)
  const [remote, setRemote] = useState<Loaded | null>(null)

  const key = `${userId ?? ''}:${attempt}`

  useEffect(() => {
    if (!persisted) return
    let active = true
    api.listTrips()
      .then((trips) => { if (active) setRemote({ key, trips, error: null }) })
      .catch((e: unknown) => { if (active) setRemote({ key, trips: [], error: e instanceof Error ? e.message : 'Could not load your trips.' }) })
    return () => { active = false }
  }, [persisted, key])

  // Only use remote data that belongs to the current user and attempt.
  const current = persisted && remote?.key === key ? remote : null
  const loading = authLoading || (persisted && !current)
  const error = current?.error ?? null
  const remoteTrips = current?.trips
  const trips = useMemo(() => (persisted ? (remoteTrips ?? []) : localTrips), [persisted, remoteTrips, localTrips])

  const retry = useCallback(() => setAttempt((a) => a + 1), [])

  const mutateRemote = useCallback((fn: (t: Trip[]) => Trip[]) => {
    setRemote((r) => (r ? { ...r, trips: fn(r.trips) } : r))
  }, [])

  const addTrip = useCallback(async (v: TripFormValues) => {
    if (persisted) {
      const trip = await api.createTrip(v)
      mutateRemote((t) => [trip, ...t])
      return trip
    }
    const trip: Trip = { ...v, title: v.title.trim(), notes: v.notes.trim(), id: `local-${Date.now().toString(36)}` }
    setLocalTrips((p) => [trip, ...p])
    return trip
  }, [persisted, mutateRemote])

  const updateTrip = useCallback(async (id: string, v: TripFormValues) => {
    if (persisted) {
      const trip = await api.updateTrip(id, v)
      mutateRemote((t) => t.map((x) => (x.id === id ? trip : x)))
      return trip
    }
    const trip: Trip = { ...v, title: v.title.trim(), notes: v.notes.trim(), id }
    setLocalTrips((p) => p.map((x) => (x.id === id ? trip : x)))
    return trip
  }, [persisted, mutateRemote])

  const removeTrip = useCallback(async (id: string) => {
    if (persisted) {
      await api.removeTrip(id)
      mutateRemote((t) => t.filter((x) => x.id !== id))
      return
    }
    setLocalTrips((p) => p.filter((x) => x.id !== id))
  }, [persisted, mutateRemote])

  const getTrip = useCallback((id: string) => trips.find((t) => t.id === id), [trips])

  const value = useMemo<TripsValue>(
    () => ({ trips, persisted, loading, error, retry, addTrip, updateTrip, removeTrip, getTrip }),
    [trips, persisted, loading, error, retry, addTrip, updateTrip, removeTrip, getTrip],
  )
  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>
}

export function useTrips() {
  const ctx = useContext(TripsContext)
  if (!ctx) throw new Error('useTrips must be used inside TripsProvider')
  return ctx
}
