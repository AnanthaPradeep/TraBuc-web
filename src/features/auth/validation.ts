export interface AuthValues { name?: string; email: string; password: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Enter your email address.'
  if (!EMAIL.test(email.trim())) return 'Enter a valid email address, like name@example.com.'
}

export function validatePassword(password: string, minLength = 8): string | undefined {
  if (!password) return 'Enter a password.'
  if (password.length < minLength) return `Use at least ${minLength} characters.`
}

export function validateSignUp(v: Required<AuthValues>) {
  const e: Partial<Record<keyof AuthValues, string>> = {}
  if (!v.name.trim()) e.name = 'Enter your name.'
  const em = validateEmail(v.email); if (em) e.email = em
  const pw = validatePassword(v.password); if (pw) e.password = pw
  return e
}

export function validateSignIn(v: AuthValues) {
  const e: Partial<Record<keyof AuthValues, string>> = {}
  const em = validateEmail(v.email); if (em) e.email = em
  if (!v.password) e.password = 'Enter your password.'
  return e
}
