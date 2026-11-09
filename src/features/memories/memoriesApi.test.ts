import { describe, expect, it, vi } from 'vitest'
import {
  createMemory, deletePhoto, getSignedUrl, listMemories, removeMemory, rowToMemory, updateMemory, uploadPhoto, valuesToPayload,
  type MemoryRow,
} from './memoriesApi'

const USER = '123e4567-e89b-12d3-a456-426614174000'
const row: MemoryRow = { id: 'm1', title: 'Sunrise', note: 'n', photo_path: `${USER}/a.jpg`, taken_on: '2027-03-09', trip_id: 't1', created_at: '2027-03-10T00:00:00Z' }
const values = { title: '  Sunrise ', note: ' n ', takenOn: '2027-03-09', tripId: 't1' }

function fake(result: { data?: unknown; error?: { message: string } | null } = {}, storage: Record<string, unknown> = {}) {
  const calls: Array<[string, ...unknown[]]> = []
  const done = { data: result.data ?? null, error: result.error ?? null }
  const chain: Record<string, unknown> = {}
  for (const m of ['select', 'order', 'insert', 'update', 'delete', 'eq']) chain[m] = (...a: unknown[]) => { calls.push([m, ...a]); return chain }
  chain.single = async () => done
  chain.then = (res: (v: unknown) => unknown) => res(done)
  const bucket = {
    upload: vi.fn(async () => ({ data: {}, error: null })),
    remove: vi.fn(async () => ({ data: [], error: null })),
    createSignedUrl: vi.fn(async () => ({ data: { signedUrl: 'https://signed.example/x?token=1' }, error: null })),
    getPublicUrl: vi.fn(),
    ...storage,
  }
  const client = {
    from: (t: string) => { calls.push(['from', t]); return chain },
    storage: { from: (b: string) => { calls.push(['bucket', b]); return bucket } },
  } as never
  return { client, calls, bucket }
}

describe('mapper', () => {
  it('maps a row to a Memory', () => {
    expect(rowToMemory(row)).toEqual({ id: 'm1', title: 'Sunrise', note: 'n', photoPath: `${USER}/a.jpg`, takenOn: '2027-03-09', tripId: 't1', createdAt: '2027-03-10T00:00:00Z' })
  })
  it('turns nulls into undefined', () => {
    const m = rowToMemory({ ...row, photo_path: null, taken_on: null, trip_id: null })
    expect(m.photoPath).toBeUndefined()
    expect(m.takenOn).toBeUndefined()
    expect(m.tripId).toBeUndefined()
  })
})

describe('valuesToPayload', () => {
  it('never includes user_id or id, and trims text', () => {
    const p = valuesToPayload(values, 'x/y.jpg')
    expect(p).toEqual({ title: 'Sunrise', note: 'n', taken_on: '2027-03-09', trip_id: 't1', photo_path: 'x/y.jpg' })
    expect(p).not.toHaveProperty('user_id')
    expect(p).not.toHaveProperty('id')
  })
  it('sends empty date and trip as null', () => {
    const p = valuesToPayload({ ...values, takenOn: '', tripId: '' })
    expect(p.taken_on).toBeNull()
    expect(p.trip_id).toBeNull()
  })
  it('leaves photo_path out when unchanged, and sends null to remove it', () => {
    expect(valuesToPayload(values)).not.toHaveProperty('photo_path')
    expect(valuesToPayload(values, undefined)).not.toHaveProperty('photo_path')
    expect(valuesToPayload(values, null).photo_path).toBeNull()
  })
})

describe('table calls', () => {
  it('lists newest first', async () => {
    const { client, calls } = fake({ data: [row] })
    expect(await listMemories(client)).toHaveLength(1)
    expect(calls).toContainEqual(['from', 'memories'])
    expect(calls).toContainEqual(['order', 'created_at', { ascending: false }])
  })
  it('creates without user_id', async () => {
    const { client, calls } = fake({ data: row })
    await createMemory(values, null, client)
    const sent = calls.find((c) => c[0] === 'insert')?.[1] as Record<string, unknown>
    expect(sent).not.toHaveProperty('user_id')
  })
  it('updates and deletes by id', async () => {
    const u = fake({ data: row })
    await updateMemory('m1', values, undefined, u.client)
    expect(u.calls).toContainEqual(['eq', 'id', 'm1'])
    const d = fake()
    await removeMemory('m1', d.client)
    expect(d.calls).toContainEqual(['eq', 'id', 'm1'])
  })
  it('surfaces database errors and a missing client', async () => {
    await expect(listMemories(fake({ error: { message: 'denied' } }).client)).rejects.toThrow('denied')
    await expect(removeMemory('m1', fake({ error: { message: 'nope' } }).client)).rejects.toThrow('nope')
    await expect(listMemories(null)).rejects.toThrow(/not configured/i)
  })
})

describe('photo storage', () => {
  const jpeg = () => new File(['x'], 'My Holiday (1).JPG', { type: 'image/jpeg' })

  it('uploads into the private bucket, under the user folder, ignoring the original file name', async () => {
    const { client, bucket, calls } = fake()
    const path = await uploadPhoto(USER, jpeg(), client)
    expect(calls).toContainEqual(['bucket', 'memory-photos'])
    expect(path).toMatch(new RegExp(`^${USER}/[0-9a-f-]{36}\\.jpg$`))
    expect(path).not.toMatch(/Holiday/)
    expect(bucket.upload).toHaveBeenCalledWith(path, expect.any(File), { contentType: 'image/jpeg', upsert: false })
  })
  it('refuses a bad file before touching storage', async () => {
    const { client, bucket } = fake()
    await expect(uploadPhoto(USER, new File(['x'], 'a.gif', { type: 'image/gif' }), client)).rejects.toThrow(/JPEG, PNG or WebP/)
    expect(bucket.upload).not.toHaveBeenCalled()
  })
  it('throws when storage rejects the upload', async () => {
    const { client } = fake({}, { upload: vi.fn(async () => ({ data: null, error: { message: 'quota' } })) })
    await expect(uploadPhoto(USER, jpeg(), client)).rejects.toThrow('quota')
  })
  it('deletes a photo by path', async () => {
    const { client, bucket } = fake()
    await deletePhoto(`${USER}/a.jpg`, client)
    expect(bucket.remove).toHaveBeenCalledWith([`${USER}/a.jpg`])
  })
  it('uses a short-lived signed URL and never a public URL', async () => {
    const { client, bucket } = fake()
    expect(await getSignedUrl(`${USER}/a.jpg`, 600, client)).toBe('https://signed.example/x?token=1')
    expect(bucket.createSignedUrl).toHaveBeenCalledWith(`${USER}/a.jpg`, 600)
    expect(bucket.getPublicUrl).not.toHaveBeenCalled()
  })
  it('throws when a signed URL cannot be created', async () => {
    const { client } = fake({}, { createSignedUrl: vi.fn(async () => ({ data: null, error: { message: 'missing' } })) })
    await expect(getSignedUrl('x/y.jpg', 600, client)).rejects.toThrow('missing')
  })
})
