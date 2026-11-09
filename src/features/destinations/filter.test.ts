import { describe, expect, it } from 'vitest'
import { destinations } from './data'
import { activeFilterCount, emptyFilters, filterDestinations, formatCoords } from './filter'

describe('filterDestinations', () => {
  it('returns everything with empty filters', () => {
    expect(filterDestinations(destinations, emptyFilters)).toHaveLength(destinations.length)
  })
  it('matches name and country case-insensitively', () => {
    const r = filterDestinations(destinations, { ...emptyFilters, query: 'JAPAN' })
    expect(r.map((d) => d.slug).sort()).toEqual(['hokkaido-shiretoko', 'kyoto'])
  })
  it('combines type and kind', () => {
    const r = filterDestinations(destinations, { ...emptyFilters, type: 'Island', kind: 'hidden' })
    expect(r.every((d) => d.type === 'Island' && d.kind === 'hidden')).toBe(true)
    expect(r.length).toBeGreaterThan(0)
  })
  it('filters by best month', () => {
    const r = filterDestinations(destinations, { ...emptyFilters, month: 4 })
    expect(r.every((d) => d.bestMonths.includes(4))).toBe(true)
  })
  it('returns no results for nonsense', () => {
    expect(filterDestinations(destinations, { ...emptyFilters, query: 'zzzz' })).toEqual([])
  })
  it('counts active filters', () => {
    expect(activeFilterCount(emptyFilters)).toBe(0)
    expect(activeFilterCount({ ...emptyFilters, query: 'a', month: 3 })).toBe(2)
  })
  it('formats coordinates', () => {
    expect(formatCoords(-13.53, -71.97)).toBe('13.53°S 71.97°W')
  })
})
