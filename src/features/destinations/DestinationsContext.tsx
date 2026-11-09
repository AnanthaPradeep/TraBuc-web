import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Destination } from './types'
import { sampleDestinations } from './data'
import { isSupabaseConfigured } from '../../lib/supabase'
import * as api from './destinationsApi'

/** Why the built-in sample list is being shown, or null when live data is shown. */
export type SampleReason = 'not-configured' | 'error' | 'empty' | null

export interface DestinationsValue {
  destinations: Destination[]
  loading: boolean
  reason: SampleReason
  error: string | null
  retry: () => void
  getDestination: (slug: string) => Destination | undefined
}

const DestinationsContext = createContext<DestinationsValue | null>(null)

interface Loaded { attempt: number; list: Destination[]; reason: SampleReason; error: string | null }

/**
 * Loads destinations from Supabase when it is configured. If it is not configured, the request fails,
 * or the table is empty, the built-in sample list is used instead (and the UI says so).
 */
export function DestinationsProvider({ children, configured = isSupabaseConfigured }: { children: ReactNode; configured?: boolean }) {
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    if (!configured) return
    let active = true
    api.listDestinations()
      .then((list) => {
        if (!active) return
        setLoaded(list.length ? { attempt, list, reason: null, error: null } : { attempt, list: sampleDestinations, reason: 'empty', error: null })
      })
      .catch((e: unknown) => {
        if (active) setLoaded({ attempt, list: sampleDestinations, reason: 'error', error: e instanceof Error ? e.message : 'Could not load destinations.' })
      })
    return () => { active = false }
  }, [configured, attempt])

  const current = configured && loaded?.attempt === attempt ? loaded : null
  const loading = configured && !current
  const currentList = current?.list
  const list = useMemo(() => (configured ? (currentList ?? []) : sampleDestinations), [configured, currentList])
  const reason: SampleReason = configured ? (current?.reason ?? null) : 'not-configured'
  const error = current?.error ?? null

  const retry = useCallback(() => setAttempt((a) => a + 1), [])
  const getDestination = useCallback((slug: string) => list.find((d) => d.slug === slug), [list])

  const value = useMemo<DestinationsValue>(
    () => ({ destinations: list, loading, reason, error, retry, getDestination }),
    [list, loading, reason, error, retry, getDestination],
  )
  return <DestinationsContext.Provider value={value}>{children}</DestinationsContext.Provider>
}

export function useDestinations() {
  const ctx = useContext(DestinationsContext)
  if (!ctx) throw new Error('useDestinations must be used inside DestinationsProvider')
  return ctx
}
