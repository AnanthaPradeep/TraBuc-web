import { Link } from 'react-router-dom'
import type { Destination } from './types'
import { Media } from '../../components/Media'
import { formatCoords, formatMonths } from './filter'

export function DestinationCard({ d }: { d: Destination }) {
  return (
    <article className="dest-card">
      <Link to={`/discover/${d.slug}`} className="dest-card-link">
        <Media src={d.image} alt={`${d.name}, ${d.country}`} seed={d.artSeed} credit={d.imageCredit} />
        <div className="dest-card-body">
          <h3>{d.name}</h3>
          <p className="muted">{d.country} · {d.type}</p>
          <p>{d.summary}</p>
          <dl className="facts">
            <div><dt>Best</dt><dd>{formatMonths(d.bestMonths)}</dd></div>
            <div><dt>Budget</dt><dd>{d.budget}</dd></div>
            <div><dt>Position</dt><dd>{formatCoords(d.lat, d.lng)}</dd></div>
          </dl>
        </div>
      </Link>
    </article>
  )
}
