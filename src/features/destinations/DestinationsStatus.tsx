import { useDestinations } from './DestinationsContext'
import { Notice, Spinner } from '../../components/ui'

/** Small loading / fallback notice shown above destination content. Renders nothing for live data. */
export function DestinationsStatus() {
  const { loading, reason, error, retry } = useDestinations()
  if (loading) return <Spinner label="Loading destinations" />
  if (reason === 'error') {
    return (
      <Notice tone="warn" title="Could not load live destinations">
        Showing built-in sample destinations instead. {error ? <span className="muted">({error})</span> : null}{' '}
        <button type="button" className="btn btn-secondary" onClick={retry}>Try again</button>
      </Notice>
    )
  }
  if (reason === 'empty') {
    return <Notice tone="info">The destinations table is empty, so built-in sample destinations are shown. Run the seed script to load them (see the README).</Notice>
  }
  if (reason === 'not-configured') {
    return <Notice tone="info">Showing built-in sample destinations. Connect Supabase to load destinations from your database.</Notice>
  }
  return null
}
