import { useSearchParams } from 'react-router-dom'
import { destinations } from './data'
import { DestinationCard } from './DestinationCard'
import { MONTHS, activeFilterCount, emptyFilters, filterDestinations, type DestinationFilters } from './filter'
import type { Budget, DestinationType } from './types'
import { EmptyState, PageHeader, SampleBadge } from '../../components/ui'

const TYPES: DestinationType[] = ['City', 'Coast', 'Desert', 'Forest', 'Island', 'Mountains']
const BUDGETS: Budget[] = ['Budget', 'Mid-range', 'Premium']

function readFilters(p: URLSearchParams): DestinationFilters {
  const type = p.get('type') ?? ''
  const budget = p.get('budget') ?? ''
  const kind = p.get('kind')
  return {
    query: p.get('q') ?? '',
    type: (TYPES as string[]).includes(type) ? (type as DestinationType) : '',
    budget: (BUDGETS as string[]).includes(budget) ? (budget as Budget) : '',
    month: Math.min(12, Math.max(0, Number(p.get('month')) || 0)),
    kind: kind === 'popular' || kind === 'hidden' ? kind : 'all',
  }
}

export function DiscoverPage() {
  const [params, setParams] = useSearchParams()
  const f = readFilters(params)
  const results = filterDestinations(destinations, f)
  const count = activeFilterCount(f)

  function set(patch: Partial<DestinationFilters>) {
    const next = { ...f, ...patch }
    const p = new URLSearchParams()
    if (next.query) p.set('q', next.query)
    if (next.type) p.set('type', next.type)
    if (next.budget) p.set('budget', next.budget)
    if (next.month) p.set('month', String(next.month))
    if (next.kind !== 'all') p.set('kind', next.kind)
    setParams(p, { replace: true })
  }

  return (
    <div className="container section">
      <PageHeader title="Discover destinations" intro={<>Search places by name, type, budget and best time to go. <SampleBadge /></>} />
      <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="field filters-search">
          <label htmlFor="q">Search</label>
          <input id="q" type="search" value={f.query} placeholder="Try “island” or “Japan”" onChange={(e) => set({ query: e.target.value })} />
        </div>
        <div className="field"><label htmlFor="kind">Show</label>
          <select id="kind" value={f.kind} onChange={(e) => set({ kind: e.target.value as DestinationFilters['kind'] })}>
            <option value="all">Popular and hidden gems</option><option value="popular">Popular</option><option value="hidden">Hidden gems</option>
          </select></div>
        <div className="field"><label htmlFor="type">Type</label>
          <select id="type" value={f.type} onChange={(e) => set({ type: e.target.value as DestinationFilters['type'] })}>
            <option value="">Any type</option>{TYPES.map((t) => <option key={t}>{t}</option>)}
          </select></div>
        <div className="field"><label htmlFor="budget">Budget</label>
          <select id="budget" value={f.budget} onChange={(e) => set({ budget: e.target.value as DestinationFilters['budget'] })}>
            <option value="">Any budget</option>{BUDGETS.map((t) => <option key={t}>{t}</option>)}
          </select></div>
        <div className="field"><label htmlFor="month">Best month</label>
          <select id="month" value={f.month} onChange={(e) => set({ month: Number(e.target.value) })}>
            <option value={0}>Any month</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select></div>
      </form>
      <div className="results-bar" aria-live="polite">
        <p>{results.length} {results.length === 1 ? 'place' : 'places'}{count ? ` with ${count} ${count === 1 ? 'filter' : 'filters'}` : ''}</p>
        {count ? <button type="button" className="btn btn-ghost" onClick={() => setParams(new URLSearchParams(), { replace: true })}>Clear filters</button> : null}
      </div>
      {results.length ? (
        <ul className="card-grid">{results.map((d) => <li key={d.slug}><DestinationCard d={d} /></li>)}</ul>
      ) : (
        <EmptyState title="No places match those filters" action={<button className="btn btn-secondary" onClick={() => set(emptyFilters)}>Clear filters</button>}>
          Try a broader search, a different month, or remove a filter.
        </EmptyState>
      )}
    </div>
  )
}
