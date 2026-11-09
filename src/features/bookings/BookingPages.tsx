import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { experiences, sampleBookings, type Experience } from './data'
import { getDestination } from '../destinations/data'
import { Media } from '../../components/Media'
import { Badge, ButtonLink, ComingSoonButton, EmptyState, Notice, PageHeader, PreviewBadge } from '../../components/ui'

const KINDS = ['All', 'Camping', 'Stay', 'Tour'] as const

function ExperienceCard({ e }: { e: Experience }) {
  const d = getDestination(e.destinationSlug)
  return (
    <article className="dest-card">
      <Link to={`/bookings/${e.id}`} className="dest-card-link">
        <Media alt={e.title} seed={e.artSeed} />
        <div className="dest-card-body">
          <h3>{e.title}</h3>
          <p className="muted">{e.kind} · {d?.name}, {d?.country}</p>
          <p>{e.description}</p>
          <p><strong>From ${e.priceFrom}</strong> <span className="muted">· {e.nights} · illustrative price</span></p>
        </div>
      </Link>
    </article>
  )
}

export function BookingsPage() {
  const [kind, setKind] = useState<(typeof KINDS)[number]>('All')
  const list = experiences.filter((e) => kind === 'All' || e.kind === kind)
  return (
    <div className="container section">
      <PageHeader title="Camping, stays and tours" intro={<>Browse the kinds of experiences TRABUC will offer. <PreviewBadge /></>} />
      <Notice tone="warn" title="Booking is not live">Listings are samples with illustrative prices. You cannot reserve or pay yet.</Notice>
      <div className="chips" role="group" aria-label="Filter by kind">
        {KINDS.map((k) => <button key={k} className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>)}
      </div>
      <ul className="card-grid">{list.map((e) => <li key={e.id}><ExperienceCard e={e} /></li>)}</ul>
    </div>
  )
}

export function BookingDetailPage() {
  const { id = '' } = useParams()
  const e = experiences.find((x) => x.id === id)
  if (!e) return <div className="container section"><EmptyState title="Experience not found" action={<ButtonLink to="/bookings">Back to bookings</ButtonLink>} /></div>
  const d = getDestination(e.destinationSlug)
  return (
    <div className="container section detail">
      <nav aria-label="Breadcrumb" className="breadcrumb"><Link to="/bookings">Book</Link> <span aria-hidden="true">/</span> <span>{e.title}</span></nav>
      <div className="detail-hero">
        <Media alt={e.title} seed={e.artSeed} />
        <div>
          <h1>{e.title}</h1>
          <p className="muted">{e.kind} · {d?.name}, {d?.country} <Badge tone="sample">Sample listing</Badge></p>
          <p className="lede">{e.description}</p>
          <p><strong>From ${e.priceFrom}</strong> · {e.nights} <span className="muted">(illustrative)</span></p>
          <h2 className="h3">Includes</h2>
          <ul className="check-list">{e.includes.map((i) => <li key={i}>{i}</li>)}</ul>
          <Notice tone="warn" title="Reservations are coming soon">Availability, checkout and payment are not connected. Nothing here can be booked.</Notice>
          <div className="btn-row"><ComingSoonButton>Check availability</ComingSoonButton>{d ? <ButtonLink to={`/discover/${d.slug}`} variant="ghost">About {d.name}</ButtonLink> : null}</div>
        </div>
      </div>
    </div>
  )
}

export function MyBookingsPage() {
  return (
    <div>
      <PageHeader title="My bookings" intro={<>Your reservations will appear here. <PreviewBadge /></>} />
      <Notice tone="info" title="No real bookings">Live booking is not available yet. The item below is a labelled example of how a booking will look.</Notice>
      {sampleBookings.length ? (
        <ul className="trip-list">
          {sampleBookings.map((b) => {
            const e = experiences.find((x) => x.id === b.experienceId)
            return e ? (
              <li key={b.id} className="trip-row"><div className="trip-thumb"><Media alt={e.title} seed={e.artSeed} /></div>
                <div><h3><Link to={`/bookings/${e.id}`}>{e.title}</Link> <Badge tone="sample">{b.status}</Badge></h3><p className="muted">{b.dates} · not a real reservation</p></div></li>
            ) : null
          })}
        </ul>
      ) : <EmptyState title="No bookings yet" action={<ButtonLink to="/bookings">Browse experiences</ButtonLink>} />}
    </div>
  )
}
