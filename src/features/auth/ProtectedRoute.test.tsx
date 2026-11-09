import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthContext, type AuthValue } from './AuthContext'
import { ProtectedRoute } from './ProtectedRoute'

const base: AuthValue = {
  configured: true, loading: false, session: null, user: null,
  signUp: async () => ({ error: null }), signIn: async () => ({ error: null }), signOut: async () => ({ error: null }),
  sendPasswordReset: async () => ({ error: null }), updatePassword: async () => ({ error: null }),
}

function setup(value: AuthValue) {
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route path="/sign-in" element={<p>sign in page</p>} />
          <Route element={<ProtectedRoute />}><Route path="/account" element={<p>private page</p>} /></Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('ProtectedRoute', () => {
  it('redirects signed-out visitors to sign in', () => {
    setup(base)
    expect(screen.getByText('sign in page')).toBeInTheDocument()
  })
  it('shows a loading state while the session is restored', () => {
    setup({ ...base, loading: true })
    expect(screen.getByRole('status')).toHaveTextContent(/checking your session/i)
  })
  it('renders the page for a signed-in user', () => {
    setup({ ...base, user: { id: '1', email: 'a@b.co' } as AuthValue['user'] })
    expect(screen.getByText('private page')).toBeInTheDocument()
  })
})
