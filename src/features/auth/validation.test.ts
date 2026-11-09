import { describe, expect, it } from 'vitest'
import { validateEmail, validatePassword, validateSignIn, validateSignUp } from './validation'

describe('auth validation', () => {
  it('flags bad emails', () => {
    expect(validateEmail('')).toBeTruthy()
    expect(validateEmail('nope')).toBeTruthy()
    expect(validateEmail('a@b.co')).toBeUndefined()
  })
  it('enforces password length', () => {
    expect(validatePassword('short')).toMatch(/at least 8/)
    expect(validatePassword('longenough')).toBeUndefined()
  })
  it('validates sign up', () => {
    expect(Object.keys(validateSignUp({ name: '', email: 'x', password: '1' }))).toEqual(['name', 'email', 'password'])
    expect(validateSignUp({ name: 'A', email: 'a@b.co', password: '12345678' })).toEqual({})
  })
  it('validates sign in', () => {
    expect(validateSignIn({ email: 'a@b.co', password: '' }).password).toBeTruthy()
  })
})
