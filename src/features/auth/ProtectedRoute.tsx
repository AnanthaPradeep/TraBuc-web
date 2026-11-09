import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { Spinner } from '../../components/ui'

/** Renders child routes only for a signed-in user; otherwise sends them to sign in and back. */
export function ProtectedRoute() {
  const { loading, user } = useAuth()
  const location = useLocation()
  if (loading) return <div className="container section"><Spinner label="Checking your session" /></div>
  if (!user) return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  return <Outlet />
}
