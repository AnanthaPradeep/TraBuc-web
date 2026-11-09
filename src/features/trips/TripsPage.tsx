import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useTrips } from './TripsContext'
import { formatDate, tripNights, validateTrip, type TripFormValues } from './dates'
import { useDestinations } from '../destinations/DestinationsContext'
import { useAuth } from '../auth/useAuth'
import { Dialog } from '../../components/Dialog'
import { Field } from '../../components/Field'
import { Media } from '../../components/Media'
import { Badge, ButtonLink, EmptyState, Notice, PageHeader, PreviewBadge, Spinner } from '../../components/ui'

function TripForm({ initial, submitLabel, onSubmit }: { initial: TripFormValues; submitLabel: string; onSubmit: (v: TripFormValues) => Promise<void> }) {
  const { destinations } = useDestinations()
  const [v, setV] = useState<TripFormValues>(initial)
  const [errors, setErrors] = useState<ReturnType<typeof validateTrip>>({})
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  async function submit(e: FormEvent) {
    e.preventDefault()
    const errs = validateTrip(v); setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true); setFailure(null)
    try {
      await onSubmit({ ...v, title: v.title.trim(), notes: v.notes.trim() })
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSaving(false)
    }
  }
  return (
    <form onSubmit={submit} noValidate className="form">
      {failure ? <Notice tone="error" title="Could not save the trip">{failure}</Notice> : null}
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
      <Field label="Notes (optional)" error={errors.notes}>{(p) => <textarea {...p} rows={3} value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} />}</Field>
      <button className="btn btn-primary btn-block" disabled={saving}>{saving ? 'Saving…' : submitLabel}</button>
    </form>
  )
}

/** Shown only when trips are not saved to an account. */
function NotSavedNotice() {
  const { configured, user } = useAuth()
  return (
    <Notice tone="info" title="Trips are not saved">
      {configured && !user
        ? <>Trips live in this browser tab only and disappear when you refresh. <Link to="/sign-in">Sign in</Link> to save trips to your account.</>
        : <>Trips live in this browser tab only and disappear when you refresh. Saving to an account is unavailable until Supabase is configured.</>}
    </Notice>
  )
}

function LoadState() {
  const { persisted, loading, error, retry } = useTrips()
  if (!persisted) return null
  if (loading) return <Spinner label="Loading your trips" />
  if (error) {
    return (
      <Notice tone="error" title="Could not load your trips">
        {error} <button type="button" className="btn btn-secondary" onClick={retry}>Try again</button>
      </Notice>
    )
  }
  return null
}

export function TripsPage({ account = false }: { account?: boolean }) {
  const { trips, persisted, loading, error, addTrip } = useTrips()
  const { getDestination, destinations } = useDestinations()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const preset = params.get('destination') ?? ''
  const [open, setOpen] = useState(Boolean(preset))
  const base = account ? '/account/trips' : '/trip-planner'
  const ready = !persisted || (!loading && !error)
  return (
    <div className={account ? undefined : 'container section'}>
      <PageHeader title={account ? 'My trips' : 'Trip planner'}
        intro={<>Sketch trips with dates and notes. {persisted ? null : <PreviewBadge />}</>}
        actions={<button className="btn btn-primary" onClick={() => setOpen(true)}><Plus size={18} aria-hidden="true" /> New trip</button>} />
      {persisted ? null : <NotSavedNotice />}
      <div className="ai-card">
        <Sparkles aria-hidden="true" />
        <div>
          <h2>AI itinerary suggestions <Badge tone="preview">Coming soon</Badge></h2>
          <p>Automatic day-by-day plans are not available yet. For now, add your dates and notes by hand.</p>
        </div>
      </div>
      <LoadState />
      {ready && trips.length ? (
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
      ) : null}
      {ready && !trips.length ? (
        <EmptyState title="No trips yet" action={<button className="btn btn-primary" onClick={() => setOpen(true)}>Plan your first trip</button>}>
          Pick a destination and dates to start.
        </EmptyState>
      ) : null}
      <Dialog open={open} onClose={() => setOpen(false)} title="New trip">
        <TripForm key={destinations.length} submitLabel="Add trip"
          initial={{ title: '', destinationSlug: getDestination(preset) ? preset : '', startDate: '', endDate: '', notes: '' }}
          onSubmit={async (v) => { const t = await addTrip(v); setOpen(false); nav(`${base}/${t.id}`) }} />
      </Dialog>
    </div>
  )
}

export function TripDetailPage({ account = false }: { account?: boolean }) {
  const { id = '' } = useParams()
  const { getTrip, updateTrip, removeTrip, persisted, loading, error } = useTrips()
  const { getDestination } = useDestinations()
  const nav = useNavigate()
  const base = account ? '/account/trips' : '/trip-planner'
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const t = getTrip(id)

  async function confirmRemove() {
    if (!t) return
    setRemoving(true); setRemoveError(null)
    try { await removeTrip(t.id); setConfirming(false); nav(base) }
    catch (err) { setRemoveError(err instanceof Error ? err.message : 'Could not remove the trip.'); setRemoving(false) }
  }

  let body
  if (persisted && (loading || error)) {
    body = <LoadState />
  } else if (!t) {
    body = (
      <EmptyState title="Trip not found" action={<ButtonLink to={base}>Back to trips</ButtonLink>}>
        {persisted ? 'This trip does not exist or is not in your account.' : 'Trips are kept in memory, so a refresh clears the ones you added.'}
      </EmptyState>
    )
  } else {
    const d = getDestination(t.destinationSlug)
    body = (
      <>
        <nav aria-label="Breadcrumb" className="breadcrumb"><Link to={base}>Trips</Link> <span aria-hidden="true">/</span> <span>{t.title}</span></nav>
        <PageHeader title={t.title} intro={<>{d ? `${d.name}, ${d.country}` : ''} · {formatDate(t.startDate)} – {formatDate(t.endDate)} ({tripNights(t.startDate, t.endDate)} nights) {t.sample ? <Badge tone="sample">Sample</Badge> : persisted ? null : <PreviewBadge />}</>} />
        {persisted ? null : <NotSavedNotice />}
        <section className="section-tight"><h2>Notes</h2><p>{t.notes || 'No notes yet.'}</p></section>
        <section className="section-tight"><h2>Itinerary</h2>
          <p className="muted">Day-by-day planning and AI suggestions are coming soon.</p></section>
        <div className="btn-row">
          {d ? <ButtonLink to={`/discover/${d.slug}`} variant="secondary">View destination</ButtonLink> : null}
          <button className="btn btn-secondary" onClick={() => setEditing(true)}><Pencil size={16} aria-hidden="true" /> Edit trip</button>
          <button className="btn btn-ghost" onClick={() => { setRemoveError(null); setConfirming(true) }}><Trash2 size={16} aria-hidden="true" /> Remove trip</button>
        </div>
        <Dialog open={editing} onClose={() => setEditing(false)} title="Edit trip">
          <TripForm submitLabel="Save changes"
            initial={{ title: t.title, destinationSlug: t.destinationSlug, startDate: t.startDate, endDate: t.endDate, notes: t.notes }}
            onSubmit={async (v) => { await updateTrip(t.id, v); setEditing(false) }} />
        </Dialog>
        <Dialog open={confirming} onClose={() => setConfirming(false)} title="Remove this trip?">
          <p>“{t.title}” will be removed{persisted ? ' from your account permanently' : ''}. This cannot be undone.</p>
          {removeError ? <Notice tone="error" title="Could not remove the trip">{removeError}</Notice> : null}
          <div className="btn-row">
            <button className="btn btn-primary" onClick={confirmRemove} disabled={removing}>{removing ? 'Removing…' : 'Remove trip'}</button>
            <button className="btn btn-ghost" onClick={() => setConfirming(false)} disabled={removing}>Cancel</button>
          </div>
        </Dialog>
      </>
    )
  }
  return <div className={account ? undefined : 'container section'}>{body}</div>
}
