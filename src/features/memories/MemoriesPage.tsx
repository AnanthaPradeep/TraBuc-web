import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { useTrips } from '../trips/TripsContext'
import { formatDate } from '../trips/dates'
import { artSeedFor } from '../destinations/destinationsApi'
import { Dialog } from '../../components/Dialog'
import { Field } from '../../components/Field'
import { Media } from '../../components/Media'
import { EmptyState, Notice, PageHeader, Spinner } from '../../components/ui'
import { useMemories, type PhotoChange } from './useMemories'
import { useSignedUrl } from './useSignedUrl'
import { PHOTO_ACCEPT, validateMemory, validatePhoto, type MemoryErrors, type MemoryValues } from './validation'
import type { Memory } from './memoriesApi'

function MemoryPhoto({ memory }: { memory: Memory }) {
  const { url, onImageError } = useSignedUrl(memory.photoPath)
  // A new URL remounts Media, which clears its "failed" state so a refreshed link can show the photo.
  return <Media key={url ?? 'none'} src={url} alt={memory.title} seed={artSeedFor(memory.id)} onError={onImageError} />
}

/** Local preview of the chosen file, shown before anything is uploaded. */
function FilePreview({ file }: { file: File }) {
  const [shown, setShown] = useState<{ file: File; url: string } | null>(null)
  useEffect(() => {
    const reader = new FileReader()
    reader.onload = () => setShown({ file, url: String(reader.result) })
    reader.readAsDataURL(file)
    return () => { reader.onload = null }
  }, [file])
  if (!shown || shown.file !== file) return null
  return <div className="memory-preview"><Media src={shown.url} alt="Preview of the selected photo" seed={1} /></div>
}

interface FormProps {
  existing: Memory | null
  onSubmit: (v: MemoryValues, photo: PhotoChange) => Promise<void>
}

function MemoryForm({ existing, onSubmit }: FormProps) {
  const { trips } = useTrips()
  const [v, setV] = useState<MemoryValues>({
    title: existing?.title ?? '', note: existing?.note ?? '', takenOn: existing?.takenOn ?? '', tripId: existing?.tripId ?? '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [errors, setErrors] = useState<MemoryErrors>({})
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  function pick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    const problem = validatePhoto(f)
    setPhotoError(problem)
    if (problem) { setFile(null); e.target.value = ''; return }
    setFile(f)
    if (f) setRemovePhoto(false)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const errs = validateMemory(v); setErrors(errs)
    if (Object.keys(errs).length || photoError) return
    setSaving(true); setFailure(null)
    try {
      await onSubmit(v, { file, removePhoto })
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="form">
      {failure ? <Notice tone="error" title="Could not save the memory">{failure}</Notice> : null}
      <Field label="Title" error={errors.title}>{(p) => <input {...p} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />}</Field>
      <Field label="Note (optional)" error={errors.note}>{(p) => <textarea {...p} rows={3} value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} />}</Field>
      <div className="form-row">
        <Field label="Date (optional)" error={errors.takenOn}>{(p) => <input {...p} type="date" value={v.takenOn} onChange={(e) => setV({ ...v, takenOn: e.target.value })} />}</Field>
        <Field label="Trip (optional)">{(p) => (
          <select {...p} value={v.tripId} onChange={(e) => setV({ ...v, tripId: e.target.value })}>
            <option value="">No trip</option>
            {trips.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>)}</Field>
      </div>
      <Field label="Photo (optional)" hint="JPEG, PNG or WebP, up to 5 MB. Stored privately in your account." error={photoError ?? undefined}>
        {(p) => <input {...p} type="file" accept={PHOTO_ACCEPT} onChange={pick} />}
      </Field>
      {file ? <FilePreview file={file} /> : null}
      {!file && existing?.photoPath ? (
        <>
          {removePhoto ? <p className="muted">The current photo will be removed when you save.</p> : <div className="memory-preview"><MemoryPhoto memory={existing} /></div>}
          <label className="check-row"><input type="checkbox" checked={removePhoto} onChange={(e) => setRemovePhoto(e.target.checked)} /> Remove current photo</label>
        </>
      ) : null}
      <button className="btn btn-primary btn-block" disabled={saving}>{saving ? 'Saving…' : existing ? 'Save changes' : 'Add memory'}</button>
    </form>
  )
}

export function MemoriesPage() {
  const { configured } = useAuth()
  const { trips } = useTrips()
  const { enabled, loading, error, memories, retry, add, update, remove } = useMemories()
  const [editing, setEditing] = useState<Memory | 'new' | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [deleting, setDeleting] = useState<Memory | null>(null)
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  if (!enabled) {
    return (
      <div>
        <PageHeader title="Memories" intro="Photos and notes from your trips." />
        <Notice tone="info" title={configured ? 'Sign in to use memories' : 'Memories are not available yet'}>
          {configured
            ? <>Memories are private to your account. <Link to="/sign-in">Sign in</Link> to add notes and photos.</>
            : 'Saving memories needs a Supabase project, and this app is not connected to one. Nothing you add here could be saved, so uploads are turned off.'}
        </Notice>
      </div>
    )
  }

  function open(target: Memory | 'new') { setFormKey((k) => k + 1); setWarning(null); setEditing(target) }

  async function save(v: MemoryValues, photo: PhotoChange) {
    if (editing && editing !== 'new') setWarning(await update(editing, v, photo))
    else await add(v, photo.file)
    setEditing(null)
  }

  async function confirmDelete() {
    if (!deleting) return
    setRemoving(true); setRemoveError(null)
    try { setWarning(await remove(deleting)); setDeleting(null) }
    catch (e) { setRemoveError(e instanceof Error ? e.message : 'Could not delete the memory.') }
    setRemoving(false)
  }

  const ready = !loading && !error
  return (
    <div>
      <PageHeader title="Memories" intro="Photos and notes from your trips. They are private to your account."
        actions={<button className="btn btn-primary" onClick={() => open('new')}><Plus size={18} aria-hidden="true" /> Add a memory</button>} />
      {warning ? <Notice tone="warn">{warning}</Notice> : null}
      {loading ? <Spinner label="Loading your memories" /> : null}
      {error ? (
        <Notice tone="error" title="Could not load your memories">
          {error} <button type="button" className="btn btn-secondary" onClick={retry}>Try again</button>
        </Notice>
      ) : null}
      {ready && memories.length ? (
        <ul className="card-grid">
          {memories.map((m) => {
            const trip = trips.find((t) => t.id === m.tripId)
            return (
              <li key={m.id}>
                <article className="dest-card">
                  <MemoryPhoto memory={m} />
                  <div className="dest-card-body">
                    <h3>{m.title}</h3>
                    <p className="muted">{m.takenOn ? formatDate(m.takenOn) : 'No date'}{trip ? ` · ${trip.title}` : ''}</p>
                    {m.note ? <p>{m.note}</p> : null}
                    <div className="btn-row">
                      <button className="btn btn-secondary" onClick={() => open(m)}><Pencil size={16} aria-hidden="true" /> Edit</button>
                      <button className="btn btn-ghost" onClick={() => { setRemoveError(null); setDeleting(m) }}><Trash2 size={16} aria-hidden="true" /> Delete</button>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      ) : null}
      {ready && !memories.length ? (
        <EmptyState title="No memories yet" action={<button className="btn btn-primary" onClick={() => open('new')}>Add your first memory</button>}>
          Save a note and an optional photo from a trip. Only you can see them.
        </EmptyState>
      ) : null}

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== 'new' ? 'Edit memory' : 'New memory'}>
        <MemoryForm key={formKey} existing={editing && editing !== 'new' ? editing : null} onSubmit={save} />
      </Dialog>
      <Dialog open={deleting !== null} onClose={() => setDeleting(null)} title="Delete this memory?">
        <p>“{deleting?.title}” will be deleted{deleting?.photoPath ? ', along with its photo,' : ''} permanently. This cannot be undone.</p>
        {removeError ? <Notice tone="error" title="Could not delete the memory">{removeError}</Notice> : null}
        <div className="btn-row">
          <button className="btn btn-primary" onClick={confirmDelete} disabled={removing}>{removing ? 'Deleting…' : 'Delete memory'}</button>
          <button className="btn btn-ghost" onClick={() => setDeleting(null)} disabled={removing}>Cancel</button>
        </div>
      </Dialog>
    </div>
  )
}
