import { useEffect } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext, type AuthValue } from '../auth/AuthContext'
import { TripsProvider, useTrips, type TripsValue } from './TripsContext'
import * as api from './tripsApi'

vi.mock('./tripsApi', () => ({
  listTrips: vi.fn(), createTrip: vi.fn(), updateTrip: vi.fn(), removeTrip: vi.fn(),
}))

const mocked = vi.mocked(api)
const values = { title: 'Mine', destinationSlug: 'kyoto', startDate: '2027-01-01', endDate: '2027-01-02', notes: '' }
const saved = { id: 'db-1', title: 'Saved', destinationSlug: 'kyoto', startDate: '2027-01-01', endDate: '2027-01-02', notes: '' }

const base: AuthValue = {
  configured: true, loading: false, session: null, user: null,
  signUp: async () => ({ error: null }), signIn: async () => ({ error: null }), signOut: async () => ({ error: null }),
  sendPasswordReset: async () => ({ error: null }), updatePassword: async () => ({ error: null }),
}
const signedIn: AuthValue = { ...base, user: { id: 'u1', email: 'a@b.co' } as AuthValue['user'] }

let ctx: TripsValue
function Probe() {
  const value = useTrips()
  useEffect(() => { ctx = value })
  return <p>{value.loading ? 'loading' : `trips:${value.trips.map((t) => t.id).join(',')}`}{value.error ? ` error:${value.error}` : ''}</p>
}
function setup(auth: AuthValue) {
  return render(<AuthContext.Provider value={auth}><TripsProvider><Probe /></TripsProvider></AuthContext.Provider>)
}

beforeEach(() => { vi.clearAllMocks() })

describe('TripsProvider signed out', () => {
  it('uses sample trips in memory and never calls the API', async () => {
    setup(base)
    expect(ctx.persisted).toBe(false)
    expect(ctx.trips.every((t) => t.sample)).toBe(true)
    await act(async () => { await ctx.addTrip(values) })
    expect(ctx.trips[0].title).toBe('Mine')
    await act(async () => { await ctx.updateTrip(ctx.trips[0].id, { ...values, title: 'Renamed' }) })
    expect(ctx.trips[0].title).toBe('Renamed')
    await act(async () => { await ctx.removeTrip(ctx.trips[0].id) })
    expect(ctx.trips.some((t) => t.title === 'Renamed')).toBe(false)
    expect(mocked.listTrips).not.toHaveBeenCalled()
    expect(mocked.createTrip).not.toHaveBeenCalled()
  })

  it('stays local when Supabase is not configured, even with a user', () => {
    setup({ ...signedIn, configured: false })
    expect(ctx.persisted).toBe(false)
    expect(mocked.listTrips).not.toHaveBeenCalled()
  })
})

describe('TripsProvider signed in', () => {
  it('loads from the API, hides sample trips and saves through the API', async () => {
    mocked.listTrips.mockResolvedValue([saved])
    mocked.createTrip.mockResolvedValue({ ...saved, id: 'db-2', title: 'New' })
    setup(signedIn)
    expect(screen.getByText('loading')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('trips:db-1')).toBeInTheDocument())
    expect(ctx.persisted).toBe(true)
    await act(async () => { await ctx.addTrip(values) })
    expect(mocked.createTrip).toHaveBeenCalledWith(values)
    expect(ctx.trips.map((t) => t.id)).toEqual(['db-2', 'db-1'])
    mocked.removeTrip.mockResolvedValue()
    await act(async () => { await ctx.removeTrip('db-1') })
    expect(mocked.removeTrip).toHaveBeenCalledWith('db-1')
    expect(ctx.trips.map((t) => t.id)).toEqual(['db-2'])
  })

  it('exposes an error and retries', async () => {
    mocked.listTrips.mockRejectedValueOnce(new Error('network down')).mockResolvedValueOnce([saved])
    setup(signedIn)
    await waitFor(() => expect(screen.getByText(/error:network down/)).toBeInTheDocument())
    act(() => ctx.retry())
    await waitFor(() => expect(screen.getByText('trips:db-1')).toBeInTheDocument())
    expect(mocked.listTrips).toHaveBeenCalledTimes(2)
  })

  it('does not change local state when a save fails', async () => {
    mocked.listTrips.mockResolvedValue([saved])
    mocked.createTrip.mockRejectedValue(new Error('denied'))
    setup(signedIn)
    await waitFor(() => expect(screen.getByText('trips:db-1')).toBeInTheDocument())
    await expect(act(async () => { await ctx.addTrip(values) })).rejects.toThrow('denied')
    expect(ctx.trips.map((t) => t.id)).toEqual(['db-1'])
  })
})
