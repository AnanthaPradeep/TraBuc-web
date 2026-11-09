import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Trip } from './types'
import { sampleTrips } from './sample'

interface TripsValue {
  trips: Trip[]
  addTrip: (t: Omit<Trip, 'id' | 'sample'>) => Trip
  removeTrip: (id: string) => void
  getTrip: (id: string) => Trip | undefined
}

const TripsContext = createContext<TripsValue | null>(null)

/** Trips live in memory only. They are lost on refresh. Persistence is a future phase. */
export function TripsProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(sampleTrips)
  const addTrip = useCallback((t: Omit<Trip, 'id' | 'sample'>) => {
    const trip: Trip = { ...t, id: `local-${Date.now().toString(36)}` }
    setTrips((prev) => [trip, ...prev])
    return trip
  }, [])
  const removeTrip = useCallback((id: string) => setTrips((p) => p.filter((t) => t.id !== id)), [])
  const getTrip = useCallback((id: string) => trips.find((t) => t.id === id), [trips])
  const value = useMemo(() => ({ trips, addTrip, removeTrip, getTrip }), [trips, addTrip, removeTrip, getTrip])
  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>
}

export function useTrips() {
  const ctx = useContext(TripsContext)
  if (!ctx) throw new Error('useTrips must be used inside TripsProvider')
  return ctx
}
