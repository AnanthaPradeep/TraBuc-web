import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Plus, Sparkles, Trash2 } from 'lucide-react'
import { useTrips } from './TripsContext'
import { formatDate, tripNights, validateTrip, type TripFormValues } from './dates'
import { destinations, getDestination } from '../destinations/data'
import { Dialog } from '../../components/Dialog'
import { Field } from '../../components/Field'
import { Media } from '../../components/Media'
import { Badge, ButtonLink, EmptyState, Notice, PageHeader, PreviewBadge } from '../../components/ui'

function NewTripForm({ initialDestination, onDone }: { initialDestination: string; onDone: (id: string) => void }) {
  const { addTrip } = useTrips()
  const [v, setV] = useState<TripFormValues>({ title: '', destinationSlug: initialDestination, startDate: '', endDate: '', notes: '' })
  const [errors, setErrors] = useState<ReturnType<typeof validateTrip>>({})
  function submit(e: FormEvent) {
    e.preventDefault()
    const errs = validateTrip(v); setErrors(errs)
    if (Object.keys(errs).length) return
    onDone(addTrip({ ...v, title: v.title.trim(), notes: v.notes.trim() }).id)
  }
  return (
    <form onSubmit={submit} noValidate className="form">
      <Field label="Trip name" error={errors.title}>{(p) => <input {...p} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />}</Field>
      <Field label="Destination" error={errors.destinationSlug}>{(p) => (
        <select {...p} value={v.destinationSlug} onChange={(e) => setV({ ...v, destinationSlug: e.target.value })}>
          <option value="">Choose a destination</option>
          {destinations.map((d) => <option key={d.slug} value={d.slug}>{d.name}, {d.country}</option>)}
        </select>)}</Field>
      <div className="form-row">
        <Field label="Start date" error={errors.startDate}>{(p) => <input {...p} type="date" value={v.startDate} onChange={(e) => setV({ ...v, startDate: e.target.value })} />}</Field>
        <Field label="End date" error={errors.endDate}>{(p) => <input {...p} type="date" value={v.endDate} onChange={(e) => setV({ ...v, endDate: e.target.value })} />}</Field>
      </div>
      <Field label="Notes (optional)">{(p) => <textarea {...p} rows={3} value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} />}</Field>
      <button className="btn btn-primary btn-block">Add trip</button>
    </form>
  )
}

export function TripsPage({ account = false }: { account?: boolean }) {
  const { trips } = useTrips()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const preset = params.get('destination') ?? ''
  const [open, setOpen] = useState(Boolean(getDestination(preset)))
  const base = account ? '/account/trips' : '/trip-planner'
  return (
    <div className={account ? undefined : 'container section'}>
      <PageHeader title={account ? 'My trips' : 'Trip planner'}
        intro={<>Sketch trips with dates and notes. <PreviewBadge /></>}
        actions={<button className="btn btn-primary" onClick={() => setOpen(true)}><Plus size={18} aria-hidden="true" /> New trip</button>} />
      <Notice tone="info" title="Trips are not saved yet">
        Trips live in this browser tab only and disappear when you refresh. Saving to your account is planned for a later phase.
      </Notice>
      <div className="ai-card">
        <Sparkles aria-hidden="true" />
        <div>
          <h2>AI itinerary suggestions <Badge tone="preview">Coming soon</Badge></h2>
          <p>Automatic day-by-day plans are not available yet. For now, add your dates and notes by hand.</p>
        </div>
      </div>
      {trips.length ? (
        <ul className="trip-list">
          {trips.map((t) => {
            const d = getDestination(t.destinationSlug)
            return (
              <li key={t.id} className="trip-row">
                {d ? <div className="trip-thumb"><Media src={d.image} alt={d.name} seed={d.artSeed} /></div> : null}
                <div>
                  <h3><Link to={`${base}/${t.id}`}>{t.title}</Link> {t.sample ? <Badge tone="sample">Sample</Badge> : null}</h3>
                  <p className="muted">{d ? `${d.name}, ${d.country}` : 'Unknown destination'} · {formatDate(t.startDate)} – {formatDate(t.endDate)} · {tripNights(t.startDate, t.endDate)} nights</p>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState title="No trips yet" action={<button className="btn btn-primary" onClick={() => setOpen(true)}>Plan your first trip</button>}>
          Pick a destination and dates to start.
        </EmptyState>
      )}
      <Dialog open={open} onClose={() => setOpen(false)} title="New trip">
        <NewTripForm initialDestination={getDestination(preset) ? preset : ''} onDone={(id) => { setOpen(false); nav(`${base}/${id}`) }} />
      </Dialog>
    </div>
  )
}

export function TripDetailPage({ account = false }: { account?: boolean }) {
  const { id = '' } = useParams()
  const { getTrip, removeTrip } = useTrips()
  const nav = useNavigate()
  const base = account ? '/account/trips' : '/trip-planner'
  const t = getTrip(id)
  const body = !t ? (
    <EmptyState title="Trip not found" action={<ButtonLink to={base}>Back to trips</ButtonLink>}>
      Trips are kept in memory, so a refresh clears the ones you added.
    </EmptyState>
  ) : (() => {
    const d = getDestination(t.destinationSlug)
    return (
      <>
        <nav aria-label="Breadcrumb" className="breadcrumb"><Link to={base}>Trips</Link> <span aria-hidden="true">/</span> <span>{t.title}</span></nav>
        <PageHeader title={t.title} intro={<>{d ? `${d.name}, ${d.country}` : ''} · {formatDate(t.startDate)} – {formatDate(t.endDate)} ({tripNights(t.startDate, t.endDate)} nights) {t.sample ? <Badge tone="sample">Sample</Badge> : <PreviewBadge />}</>} />
        <section className="section-tight"><h2>Notes</h2><p>{t.notes || 'No notes yet.'}</p></section>
        <section className="section-tight"><h2>Itinerary</h2>
          <p className="muted">Day-by-day planning and AI suggestions are coming soon.</p></section>
        <div className="btn-row">
          {d ? <ButtonLink to={`/discover/${d.slug}`} variant="secondary">View destination</ButtonLink> : null}
          <button className="btn btn-ghost" onClick={() => { removeTrip(t.id); nav(base) }}><Trash2 size={16} aria-hidden="true" /> Remove trip</button>
        </div>
      </>
    )
  })()
  return <div className={account ? undefined : 'container section'}>{body}</div>
}
