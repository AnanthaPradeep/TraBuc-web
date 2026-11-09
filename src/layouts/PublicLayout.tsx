import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'

export const publicNav = [
  { to: '/discover', label: 'Discover' },
  { to: '/trip-planner', label: 'Plan a trip' },
  { to: '/bookings', label: 'Book' },
  { to: '/tools', label: 'Travel tools' },
  { to: '/stories', label: 'Stories' },
]

export function Wordmark() {
  return <Link to="/" className="wordmark" aria-label="TRABUC home">TRABUC</Link>
}

function linkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'nav-link is-active' : 'nav-link'
}

export function PublicLayout() {
  const { user, signOut } = useAuth()
  // The menu is tied to the page it was opened on, so navigating closes it.
  const { pathname } = useLocation()
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const setOpen = (v: boolean) => setOpenOn(v ? pathname : null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenOn(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const actions = user ? (
    <>
      <Link className="btn btn-secondary" to="/account">My account</Link>
      <button className="btn btn-ghost" onClick={() => void signOut()}>Sign out</button>
    </>
  ) : (
    <>
      <Link className="btn btn-ghost" to="/sign-in">Sign in</Link>
      <Link className="btn btn-primary" to="/sign-up">Join</Link>
    </>
  )

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="container header-row">
          <Wordmark />
          <nav className="nav-desktop" aria-label="Main">
            {publicNav.map((n) => <NavLink key={n.to} to={n.to} className={linkClass}>{n.label}</NavLink>)}
          </nav>
          <div className="header-actions">{actions}</div>
          <button className="icon-btn menu-toggle" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
        {open ? (
          <div id="mobile-nav" className="nav-mobile">
            <nav aria-label="Main mobile" className="container">
              {publicNav.map((n) => <NavLink key={n.to} to={n.to} className={linkClass}>{n.label}</NavLink>)}
              <NavLink to="/about" className={linkClass}>About</NavLink>
              <NavLink to="/help" className={linkClass}>Help</NavLink>
              <div className="nav-mobile-actions">{actions}</div>
            </nav>
          </div>
        ) : null}
      </header>
      <main id="main" tabIndex={-1}><Outlet /></main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Wordmark />
            <p className="muted">A travel companion for discovering places, planning trips and keeping memories.</p>
          </div>
          <nav aria-label="Explore"><h2 className="footer-title">Explore</h2>
            <ul>{publicNav.map((n) => <li key={n.to}><Link to={n.to}>{n.label}</Link></li>)}</ul></nav>
          <nav aria-label="Company"><h2 className="footer-title">TRABUC</h2>
            <ul><li><Link to="/about">About</Link></li><li><Link to="/help">Contact and help</Link></li><li><Link to="/sign-up">Join</Link></li></ul></nav>
        </div>
        <div className="container footer-note">
          <p>This is an early preview. Destinations, stories and prices are sample content. Bookings, payments and translation are not live yet.</p>
        </div>
      </footer>
    </>
  )
}
