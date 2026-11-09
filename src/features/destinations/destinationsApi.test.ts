import { describe, expect, it } from 'vitest'
import { artSeedFor, getDestinationBySlug, listDestinations, rowToDestination, type DestinationRow } from './destinationsApi'

const row: DestinationRow = {
  slug: 'kyoto', name: 'Kyoto', country: 'Japan', type: 'City', kind: 'popular', budget: 'Mid-range',
  best_months: [3, 4, 10, 11], lat: 35.01, lng: 135.77, elevation: 50, summary: 's', highlights: ['a', 'b'],
  image_url: null, image_credit: null, image_license: null, verified: false,
}

function fake(result: { data?: unknown; error?: { message: string } | null }) {
  const calls: Array<[string, ...unknown[]]> = []
  const chain: Record<string, unknown> = {}
  const done = { data: result.data ?? null, error: result.error ?? null }
  for (const m of ['select', 'order', 'eq']) chain[m] = (...a: unknown[]) => { calls.push([m, ...a]); return chain }
  chain.maybeSingle = async () => done
  chain.then = (res: (v: unknown) => unknown) => res(done)
  return { client: { from: (t: string) => { calls.push(['from', t]); return chain } } as never, calls }
}

describe('rowToDestination', () => {
  it('maps snake_case columns to the Destination type', () => {
    expect(rowToDestination(row)).toMatchObject({
      slug: 'kyoto', name: 'Kyoto', country: 'Japan', type: 'City', kind: 'popular', budget: 'Mid-range',
      bestMonths: [3, 4, 10, 11], lat: 35.01, lng: 135.77, elevation: 50, summary: 's', highlights: ['a', 'b'], verified: false,
    })
  })
  it('leaves image fields undefined when empty, so the generated artwork is used', () => {
    const d = rowToDestination(row)
    expect(d.image).toBeUndefined()
    expect(d.imageCredit).toBeUndefined()
    expect(d.imageLicense).toBeUndefined()
    expect(rowToDestination({ ...row, image_url: '  ', image_credit: '' }).image).toBeUndefined()
  })
  it('keeps image, credit and licence when present', () => {
    const d = rowToDestination({ ...row, image_url: 'https://example.com/a.jpg', image_credit: ' Photo: A ', image_license: 'CC BY 4.0' })
    expect(d.image).toBe('https://example.com/a.jpg')
    expect(d.imageCredit).toBe('Photo: A')
    expect(d.imageLicense).toBe('CC BY 4.0')
  })
  it('ignores image URLs that are not http(s)', () => {
    expect(rowToDestination({ ...row, image_url: 'javascript:alert(1)' }).image).toBeUndefined()
    expect(rowToDestination({ ...row, image_url: 'data:image/png;base64,AAAA' }).image).toBeUndefined()
  })
  it('treats only verified = true as verified', () => {
    expect(rowToDestination({ ...row, verified: true }).verified).toBe(true)
    expect(rowToDestination({ ...row, verified: null as unknown as boolean }).verified).toBe(false)
  })
  it('derives a stable art seed from the slug', () => {
    expect(artSeedFor('kyoto')).toBe(artSeedFor('kyoto'))
    expect(artSeedFor('kyoto')).not.toBe(artSeedFor('cusco'))
    expect(rowToDestination(row).artSeed).toBe(artSeedFor('kyoto'))
  })
})

describe('destinations api', () => {
  it('lists destinations ordered by name', async () => {
    const { client, calls } = fake({ data: [row] })
    const list = await listDestinations(client)
    expect(list.map((d) => d.slug)).toEqual(['kyoto'])
    expect(calls).toContainEqual(['from', 'destinations'])
    expect(calls).toContainEqual(['order', 'name', { ascending: true }])
  })
  it('gets one by slug, or null when missing', async () => {
    const hit = fake({ data: row })
    expect((await getDestinationBySlug('kyoto', hit.client))?.name).toBe('Kyoto')
    expect(hit.calls).toContainEqual(['eq', 'slug', 'kyoto'])
    expect(await getDestinationBySlug('nope', fake({ data: null }).client)).toBeNull()
  })
  it('throws on database errors and when not configured', async () => {
    await expect(listDestinations(fake({ error: { message: 'boom' } }).client)).rejects.toThrow('boom')
    await expect(getDestinationBySlug('x', fake({ error: { message: 'bad' } }).client)).rejects.toThrow('bad')
    await expect(listDestinations(null)).rejects.toThrow(/not configured/i)
  })
})
