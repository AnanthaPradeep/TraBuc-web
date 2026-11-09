import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Badge, PageHeader } from '../../components/ui'
import { useTrips } from '../trips/TripsContext'

export function AccountPage() {
  const { user } = useAuth()
  const { trips } = useTrips()
  const name = (user?.user_metadata?.full_name as string | undefined) || 'Not set'
  const joined = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { dateStyle: 'long' }) : 'Unknown'
  return (
    <div>
      <PageHeader title="Your account" intro="Details from your sign-in." />
      <dl className="profile-list">
        <div><dt>Name</dt><dd>{name}</dd></div>
        <div><dt>Email</dt><dd>{user?.email}</dd></div>
        <div><dt>Member since</dt><dd>{joined}</dd></div>
      </dl>
      <p className="muted">Editing your profile is <Badge tone="preview">coming soon</Badge>. To change your password, <Link to="/forgot-password">request a reset link</Link>.</p>
      <h2>At a glance</h2>
      <ul className="list-plain">
        <li><Link to="/account/trips">My trips</Link> <span className="muted">· {trips.length} in this session (not saved)</span></li>
        <li><Link to="/account/bookings">My bookings</Link> <span className="muted">· preview</span></li>
        <li><Link to="/account/memories">Memories</Link> <span className="muted">· coming soon</span></li>
      </ul>
    </div>
  )
}
