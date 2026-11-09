import type { Budget, Destination, DestinationType } from './types'

export interface DestinationFilters {
  query: string
  type: DestinationType | ''
  budget: Budget | ''
  /** 1-12, or 0 for any month. */
  month: number
  kind: 'all' | 'popular' | 'hidden'
}

export const emptyFilters: DestinationFilters = { query: '', type: '', budget: '', month: 0, kind: 'all' }

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function filterDestinations(list: Destination[], f: DestinationFilters): Destination[] {
  const q = f.query.trim().toLowerCase()
  return list.filter((d) => {
    if (q && ![d.name, d.country, d.type, d.summary].some((s) => s.toLowerCase().includes(q))) return false
    if (f.type && d.type !== f.type) return false
    if (f.budget && d.budget !== f.budget) return false
    if (f.month && !d.bestMonths.includes(f.month)) return false
    if (f.kind !== 'all' && d.kind !== f.kind) return false
    return true
  })
}

export function activeFilterCount(f: DestinationFilters): number {
  return [f.query.trim(), f.type, f.budget, f.month, f.kind !== 'all'].filter(Boolean).length
}

export function formatCoords(lat: number, lng: number): string {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(2)}°${ns} ${Math.abs(lng).toFixed(2)}°${ew}`
}

export function formatMonths(months: number[]): string {
  const sorted = [...months].sort((a, b) => a - b)
  return sorted.map((m) => MONTHS[m - 1].slice(0, 3)).join(', ')
}
