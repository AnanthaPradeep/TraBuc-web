import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { Field } from '../../components/Field'
import { Notice } from '../../components/ui'
import { validateEmail, validatePassword, validateSignIn, validateSignUp } from './validation'

function Shell({ title, intro, children, footer }: { title: string; intro: string; children: ReactNode; footer: ReactNode }) {
  const { configured } = useAuth()
  return (
    <div className="container auth-wrap">
      <div className="auth-card">
        <h1>{title}</h1>
        <p className="lede">{intro}</p>
        {!configured ? (
          <Notice tone="warn" title="Authentication is not configured">
            Add your Supabase URL and anon key to a <code>.env</code> file to turn on accounts. The setup steps are in the README.
          </Notice>
        ) : null}
        {children}
        <p className="auth-footer">{footer}</p>
      </div>
    </div>
  )
}

export function SignInPage() {
  const { signIn, user, configured } = useAuth()
  const nav = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/account'
  const [v, setV] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<ReturnType<typeof validateSignIn>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to={from} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = validateSignIn(v); setErrors(errs); setFormError(null)
    if (Object.keys(errs).length) return
    setBusy(true)
    const r = await signIn(v.email.trim(), v.password)
    setBusy(false)
    if (r.error) setFormError(r.error); else nav(from, { replace: true })
  }
  return (
    <Shell title="Sign in" intro="Welcome back. Sign in to see your trips, bookings and memories."
      footer={<>New to TRABUC? <Link to="/sign-up">Create an account</Link></>}>
      <form onSubmit={onSubmit} noValidate className="form">
        {formError ? <Notice tone="error" title="Could not sign in">{formError}</Notice> : null}
        <Field label="Email" error={errors.email}>{(p) => <input {...p} type="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />}</Field>
        <Field label="Password" error={errors.password}>{(p) => <input {...p} type="password" autoComplete="current-password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} />}</Field>
        <p className="form-aside"><Link to="/forgot-password">Forgot your password?</Link></p>
        <button className="btn btn-primary btn-block" disabled={busy || !configured}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </Shell>
  )
}

export function SignUpPage() {
  const { signUp, user, configured } = useAuth()
  const nav = useNavigate()
  const [v, setV] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<ReturnType<typeof validateSignUp>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  if (user && !confirm) return <Navigate to="/account" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = validateSignUp(v); setErrors(errs); setFormError(null)
    if (Object.keys(errs).length) return
    setBusy(true)
    const r = await signUp(v.name.trim(), v.email.trim(), v.password)
    setBusy(false)
    if (r.error) setFormError(r.error)
    else if (r.needsConfirmation) setConfirm(true)
    else nav('/account', { replace: true })
  }
  if (confirm) {
    return (
      <Shell title="Check your email" intro="Your account is created, but the email address needs confirming first."
        footer={<>Already confirmed? <Link to="/sign-in">Sign in</Link></>}>
        <Notice tone="success">We asked Supabase to send a confirmation link to <strong>{v.email}</strong>. Open it, then sign in.</Notice>
      </Shell>
    )
  }
  return (
    <Shell title="Create your account" intro="Join TRABUC to keep your trips, bookings and memories in one place."
      footer={<>Already have an account? <Link to="/sign-in">Sign in</Link></>}>
      <form onSubmit={onSubmit} noValidate className="form">
        {formError ? <Notice tone="error" title="Could not create account">{formError}</Notice> : null}
        <Field label="Name" error={errors.name}>{(p) => <input {...p} autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />}</Field>
        <Field label="Email" error={errors.email}>{(p) => <input {...p} type="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />}</Field>
        <Field label="Password" error={errors.password} hint="At least 8 characters.">{(p) => <input {...p} type="password" autoComplete="new-password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} />}</Field>
        <button className="btn btn-primary btn-block" disabled={busy || !configured}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
    </Shell>
  )
}

export function ForgotPasswordPage() {
  const { sendPasswordReset, configured } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [formError, setFormError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const err = validateEmail(email); setError(err); setFormError(null)
    if (err) return
    setBusy(true)
    const r = await sendPasswordReset(email.trim())
    setBusy(false)
    if (r.error) setFormError(r.error); else setSent(true)
  }
  return (
    <Shell title="Reset your password" intro="Enter your email and we will ask Supabase to send a reset link."
      footer={<Link to="/sign-in">Back to sign in</Link>}>
      {sent ? (
        <Notice tone="success">If an account exists for <strong>{email}</strong>, a reset link is on its way.</Notice>
      ) : (
        <form onSubmit={onSubmit} noValidate className="form">
          {formError ? <Notice tone="error" title="Could not send the link">{formError}</Notice> : null}
          <Field label="Email" error={error}>{(p) => <input {...p} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
          <button className="btn btn-primary btn-block" disabled={busy || !configured}>{busy ? 'Sending…' : 'Send reset link'}</button>
        </form>
      )}
    </Shell>
  )
}

export function ResetPasswordPage() {
  const { updatePassword, user, loading, configured } = useAuth()
  const nav = useNavigate()
  const [pw, setPw] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const err = validatePassword(pw); setError(err); setFormError(null)
    if (err) return
    setBusy(true)
    const r = await updatePassword(pw)
    setBusy(false)
    if (r.error) setFormError(r.error); else nav('/account', { replace: true })
  }
  return (
    <Shell title="Choose a new password" intro="Open this page from the link in your reset email."
      footer={<Link to="/sign-in">Back to sign in</Link>}>
      {!loading && !user && configured ? (
        <Notice tone="warn" title="Reset link needed">This page works after you follow the link in your reset email. <Link to="/forgot-password">Request a new link</Link>.</Notice>
      ) : (
        <form onSubmit={onSubmit} noValidate className="form">
          {formError ? <Notice tone="error" title="Could not update password">{formError}</Notice> : null}
          <Field label="New password" error={error} hint="At least 8 characters.">{(p) => <input {...p} type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />}</Field>
          <button className="btn btn-primary btn-block" disabled={busy || !configured}>{busy ? 'Saving…' : 'Update password'}</button>
        </form>
      )}
    </Shell>
  )
}
