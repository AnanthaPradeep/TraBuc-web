import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { destinations } from '../destinations/data'
import { DestinationCard } from '../destinations/DestinationCard'
import { formatCoords } from '../destinations/filter'
import { ContourArt } from '../../components/ContourArt'
import { ButtonLink, SampleBadge } from '../../components/ui'

const popular = destinations.filter((d) => d.kind === 'popular').slice(0, 3)
const hidden = destinations.filter((d) => d.kind === 'hidden').slice(0, 3)
const quick = ['Island', 'Mountains', 'Coast', 'Desert']

export function HomePage() {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  function submit(e: FormEvent) {
    e.preventDefault()
    nav(q.trim() ? `/discover?q=${encodeURIComponent(q.trim())}` : '/discover')
  }
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1>Where to next?</h1>
            <p className="lede">Find a place, sketch the trip, and keep what you remember. TRABUC brings discovery, planning and travel help into one calm workspace.</p>
            <form className="hero-search" role="search" onSubmit={submit}>
              <label htmlFor="hero-q" className="sr-only">Search destinations</label>
              <Search aria-hidden="true" size={20} />
              <input id="hero-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a place, country or type" />
              <button className="btn btn-primary">Search</button>
            </form>
            <p className="quick">Or start with{' '}
              {quick.map((t, i) => <span key={t}><Link to={`/discover?type=${t}`}>{t.toLowerCase()}</Link>{i < quick.length - 1 ? ', ' : '.'}</span>)}
            </p>
          </div>
          <div className="hero-map" aria-label="Sample destination index">
            <ContourArt seed={19} label="Contour map artwork" />
            <ul className="hero-index">
              {destinations.slice(0, 5).map((d) => (
                <li key={d.slug}><Link to={`/discover/${d.slug}`}><span>{d.name}</span><span className="coord">{formatCoords(d.lat, d.lng)}</span></Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head"><h2>Popular destinations</h2><Link to="/discover?kind=popular">See all popular</Link></div>
        <p className="muted small"><SampleBadge /> Descriptions are placeholders for this preview.</p>
        <ul className="card-grid">{popular.map((d) => <li key={d.slug}><DestinationCard d={d} /></li>)}</ul>
      </section>

      <section className="band">
        <div className="container section">
          <div className="section-head"><h2>Hidden gems</h2><Link to="/discover?kind=hidden">See all hidden gems</Link></div>
          <ul className="card-grid">{hidden.map((d) => <li key={d.slug}><DestinationCard d={d} /></li>)}</ul>
        </div>
      </section>

      <section className="container section">
        <h2>What you can do here</h2>
        <ul className="feature-list">
          <li><h3><Link to="/trip-planner">Plan trips</Link></h3><p>Add dates and notes for each trip. Sign in to save them to your account.</p></li>
          <li><h3><Link to="/bookings">Browse camping and stays</Link></h3><p>See the kinds of experiences planned. Booking is not live yet.</p></li>
          <li><h3><Link to="/tools">Use travel tools</Link></h3><p>Language and currency help are in preview.</p></li>
          <li><h3><Link to="/stories">Read travel stories</Link></h3><p>Sample stories show how memories will be shared.</p></li>
        </ul>
        <div className="btn-row"><ButtonLink to="/sign-up">Create a free account</ButtonLink><ButtonLink to="/discover" variant="secondary">Start exploring</ButtonLink></div>
      </section>
    </>
  )
}
