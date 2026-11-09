import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'

export interface AuthResult { error: string | null; needsConfirmation?: boolean }

export interface AuthValue {
  configured: boolean
  loading: boolean
  session: Session | null
  user: User | null
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
  sendPasswordReset: (email: string) => Promise<AuthResult>
  updatePassword: (password: string) => Promise<AuthResult>
}

export const AuthContext = createContext<AuthValue | null>(null)

const NOT_CONFIGURED = 'Authentication is not configured. Add your Supabase URL and anon key to .env (see README).'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    }).catch(() => active && setLoading(false))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => { active = false; data.subscription.unsubscribe() }
  }, [])

  const signUp = useCallback<AuthValue['signUp']>(async (name, email, password) => {
    if (!supabase) return { error: NOT_CONFIGURED }
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: window.location.origin } })
    if (error) return { error: error.message }
    return { error: null, needsConfirmation: !data.session }
  }, [])

  const signIn = useCallback<AuthValue['signIn']>(async (email, password) => {
    if (!supabase) return { error: NOT_CONFIGURED }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? error.message : null }
  }, [])

  const signOut = useCallback<AuthValue['signOut']>(async () => {
    if (!supabase) return { error: null }
    const { error } = await supabase.auth.signOut()
    return { error: error ? error.message : null }
  }, [])

  const sendPasswordReset = useCallback<AuthValue['sendPasswordReset']>(async (email) => {
    if (!supabase) return { error: NOT_CONFIGURED }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
    return { error: error ? error.message : null }
  }, [])

  const updatePassword = useCallback<AuthValue['updatePassword']>(async (password) => {
    if (!supabase) return { error: NOT_CONFIGURED }
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error ? error.message : null }
  }, [])

  const value = useMemo<AuthValue>(() => ({
    configured: isSupabaseConfigured, loading, session, user: session?.user ?? null,
    signUp, signIn, signOut, sendPasswordReset, updatePassword,
  }), [loading, session, signUp, signIn, signOut, sendPasswordReset, updatePassword])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
