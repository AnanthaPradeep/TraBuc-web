import { describe, expect, it } from 'vitest'
import type { User } from '@supabase/supabase-js'
import { fetchProfile, resolveName, type Profile } from './profile'

const profile = (full_name: string | null): Profile => ({ id: '1', full_name, created_at: '2026-01-01' })
const user = (full_name?: unknown) => ({ id: '1', user_metadata: { full_name } }) as unknown as User

function fakeClient(result: { data: unknown; error: { message: string } | null }) {
  const calls: unknown[][] = []
  const chain = {
    select: (...a: unknown[]) => { calls.push(['select', ...a]); return chain },
    eq: (...a: unknown[]) => { calls.push(['eq', ...a]); return chain },
    maybeSingle: async () => result,
  }
  return { client: { from: (t: string) => { calls.push(['from', t]); return chain } } as never, calls }
}

describe('resolveName', () => {
  it('prefers the profile name', () => expect(resolveName(profile(' Ada '), user('Other'))).toBe('Ada'))
  it('falls back to sign-up metadata', () => expect(resolveName(profile(null), user('Grace'))).toBe('Grace'))
  it('returns null when nothing is set', () => {
    expect(resolveName(null, user())).toBeNull()
    expect(resolveName(profile('  '), user(42))).toBeNull()
    expect(resolveName(null, null)).toBeNull()
  })
})

describe('fetchProfile', () => {
  it('queries profiles by user id', async () => {
    const { client, calls } = fakeClient({ data: profile('Ada'), error: null })
    expect((await fetchProfile(client, 'u1'))?.full_name).toBe('Ada')
    expect(calls).toContainEqual(['from', 'profiles'])
    expect(calls).toContainEqual(['eq', 'id', 'u1'])
  })
  it('returns null when no row exists', async () => {
    expect(await fetchProfile(fakeClient({ data: null, error: null }).client, 'u1')).toBeNull()
  })
  it('throws on a Supabase error', async () => {
    await expect(fetchProfile(fakeClient({ data: null, error: { message: 'boom' } }).client, 'u1')).rejects.toThrow('boom')
  })
})
