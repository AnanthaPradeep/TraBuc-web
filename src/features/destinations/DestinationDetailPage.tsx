import { Link, useParams } from 'react-router-dom'
import { useDestinations } from './DestinationsContext'
import { DestinationsStatus } from './DestinationsStatus'
import { formatCoords, formatMonths } from './filter'
import { Media } from '../../components/Media'
import { ButtonLink, EmptyState, SampleBadge, Spinner } from '../../components/ui'
import { experiences } from '../bookings/data'

export function DestinationDetailPage() {
  const { slug = '' } = useParams()
  const { getDestination, loading } = useDestinations()
  const d = getDestination(slug)
  if (loading) return <div className="container section"><Spinner label="Loading destination" /></div>
  if (!d) {
    return <div className="container section"><DestinationsStatus /><EmptyState title="We could not find that destination" action={<ButtonLink to="/discover">Back to Discover</ButtonLink>}>It may have been renamed or removed.</EmptyState></div>
  }
  const related = experiences.filter((e) => e.destinationSlug === d.slug)
  return (
    <div className="container section detail">
      <DestinationsStatus />
      <nav aria-label="Breadcrumb" className="breadcrumb"><Link to="/discover">Discover</Link> <span aria-hidden="true">/</span> <span>{d.name}</span></nav>
      <div className="detail-hero">
        <Media src={d.image} alt={`${d.name}, ${d.country}`} seed={d.artSeed} credit={d.imageCredit} />
        <div>
          <h1>{d.name}</h1>
          <p className="muted">{d.country} · {d.type} · {d.kind === 'hidden' ? 'Hidden gem' : 'Popular'} {d.verified ? null : <SampleBadge />}</p>
          <p className="lede">{d.summary}</p>
          <dl className="facts facts-lg">
            <div><dt>Best months</dt><dd>{formatMonths(d.bestMonths)}</dd></div>
            <div><dt>Budget</dt><dd>{d.budget}</dd></div>
            <div><dt>Position</dt><dd>{formatCoords(d.lat, d.lng)}</dd></div>
            <div><dt>Elevation</dt><dd>about {d.elevation.toLocaleString()} m</dd></div>
          </dl>
          <div className="btn-row">
            <ButtonLink to={`/trip-planner?destination=${d.slug}`}>Plan a trip here</ButtonLink>
            <ButtonLink to="/bookings" variant="secondary">See stays and tours</ButtonLink>
          </div>
        </div>
      </div>
      <section className="section-tight">
        <h2>Things to know</h2>
        <ul className="check-list">{d.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
        <p className="muted small">{d.verified ? '' : 'Sample notes for the preview. '}Check current entry rules, safety advice and seasonal conditions before travelling.</p>
      </section>
      {related.length ? (
        <section className="section-tight">
          <h2>Stays and tours here</h2>
          <ul className="list-plain">{related.map((e) => <li key={e.id}><Link to={`/bookings/${e.id}`}>{e.title}</Link> <span className="muted">from ${e.priceFrom} · preview only</span></li>)}</ul>
        </section>
      ) : null}
    </div>
  )
}
