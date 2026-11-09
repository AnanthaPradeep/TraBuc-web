import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { CalendarCheck, Compass, Images, LogOut, Map, User } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'
import { Wordmark } from './PublicLayout'

const items = [
  { to: '/account', label: 'Profile', icon: User, end: true },
  { to: '/account/trips', label: 'My trips', icon: Map },
  { to: '/account/bookings', label: 'My bookings', icon: CalendarCheck },
  { to: '/account/memories', label: 'Memories', icon: Images },
]

export function AccountLayout() {
  const { user, signOut } = useAuth()
  const nav = useNavigate()
  const [menu, setMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? 'Traveller'

  useEffect(() => {
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent) { if (e.key === 'Escape') setMenu(false) }
      else if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close) }
  }, [])

  async function out() { await signOut(); nav('/', { replace: true }) }

  return (
    <div className="account-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="container header-row">
          <Wordmark />
          <Link className="btn btn-ghost account-explore" to="/discover"><Compass size={18} aria-hidden="true" /> Explore</Link>
          <div className="profile-menu" ref={ref}>
            <button className="btn btn-secondary" aria-expanded={menu} aria-haspopup="true" onClick={() => setMenu(!menu)}>
              <span className="avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
              <span className="profile-name">{name}</span>
            </button>
            {menu ? (
              <div className="menu-panel">
                <Link to="/account" onClick={() => setMenu(false)}>Profile</Link>
                <button onClick={() => void out()}><LogOut size={16} aria-hidden="true" /> Sign out</button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <div className="container account-grid">
        <nav className="account-nav" aria-label="Account">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'account-link is-active' : 'account-link')}>
              <Icon size={18} aria-hidden="true" /> <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <main id="main" tabIndex={-1} className="account-main"><Outlet /></main>
      </div>
    </div>
  )
}
