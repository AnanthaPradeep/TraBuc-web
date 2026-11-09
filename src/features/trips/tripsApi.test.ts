import { describe, expect, it } from 'vitest'
import { createTrip, listTrips, removeTrip, rowToTrip, updateTrip, valuesToPayload, type TripRow } from './tripsApi'
import { validateTrip } from './dates'

const row: TripRow = { id: 'abc', title: 'Kyoto', destination_slug: 'kyoto', start_date: '2027-11-08', end_date: '2027-11-15', notes: 'n', created_at: 'x', updated_at: 'y' }
const values = { title: '  Kyoto ', destinationSlug: 'kyoto', startDate: '2027-11-08', endDate: '2027-11-15', notes: ' n ' }

function fake(result: { data?: unknown; error?: { message: string } | null }) {
  const calls: Array<[string, unknown?]> = []
  const chain: Record<string, unknown> = {}
  for (const m of ['select', 'order', 'insert', 'update', 'delete', 'eq']) {
    chain[m] = (arg?: unknown) => { calls.push([m, arg]); return chain }
  }
  chain.single = async () => ({ data: result.data ?? null, error: result.error ?? null })
  chain.then = (res: (v: unknown) => unknown) => res({ data: result.data ?? null, error: result.error ?? null })
  return { client: { from: (t: string) => { calls.push(['from', t]); return chain } } as never, calls }
}

describe('mapper', () => {
  it('maps a row to a Trip', () => {
    expect(rowToTrip(row)).toEqual({ id: 'abc', title: 'Kyoto', destinationSlug: 'kyoto', startDate: '2027-11-08', endDate: '2027-11-15', notes: 'n' })
  })
  it('maps form values to a payload without user_id and trims text', () => {
    const p = valuesToPayload(values)
    expect(p).toEqual({ title: 'Kyoto', destination_slug: 'kyoto', start_date: '2027-11-08', end_date: '2027-11-15', notes: 'n' })
    expect(p).not.toHaveProperty('user_id')
    expect(p).not.toHaveProperty('id')
  })
})

describe('api', () => {
  it('lists newest first', async () => {
    const { client, calls } = fake({ data: [row] })
    expect(await listTrips(client)).toHaveLength(1)
    expect(calls).toContainEqual(['from', 'trips'])
    expect(calls.find((c) => c[0] === 'order')).toBeTruthy()
  })
  it('creates without user_id', async () => {
    const { client, calls } = fake({ data: row })
    expect((await createTrip(values, client)).id).toBe('abc')
    const sent = calls.find((c) => c[0] === 'insert')?.[1] as Record<string, unknown>
    expect(sent).not.toHaveProperty('user_id')
  })
  it('updates by id and removes by id', async () => {
    const u = fake({ data: row })
    await updateTrip('abc', values, u.client)
    expect(u.calls).toContainEqual(['eq', 'id'])
    const r = fake({})
    await expect(removeTrip('abc', r.client)).resolves.toBeUndefined()
    expect(r.calls).toContainEqual(['delete', undefined])
  })
  it('surfaces database errors', async () => {
    await expect(listTrips(fake({ error: { message: 'denied' } }).client)).rejects.toThrow('denied')
    await expect(removeTrip('abc', fake({ error: { message: 'nope' } }).client)).rejects.toThrow('nope')
  })
  it('throws when Supabase is not configured', async () => {
    await expect(listTrips(null)).rejects.toThrow(/not configured/i)
  })
})

describe('validation limits', () => {
  const ok = { title: 't', destinationSlug: 'kyoto', startDate: '2027-01-01', endDate: '2027-01-02', notes: '' }
  it('accepts valid input', () => expect(validateTrip(ok)).toEqual({}))
  it('limits title to 120 and notes to 2000', () => {
    expect(validateTrip({ ...ok, title: 'a'.repeat(121) }).title).toMatch(/120/)
    expect(validateTrip({ ...ok, title: 'a'.repeat(120) }).title).toBeUndefined()
    expect(validateTrip({ ...ok, notes: 'a'.repeat(2001) }).notes).toMatch(/2000/)
    expect(validateTrip({ ...ok, notes: 'a'.repeat(2000) }).notes).toBeUndefined()
  })
  it('allows a same-day trip', () => expect(validateTrip({ ...ok, endDate: ok.startDate })).toEqual({}))
})
