export function tripNights(start: string, end: string): number {
  const a = Date.parse(start)
  const b = Date.parse(end)
  if (Number.isNaN(a) || Number.isNaN(b)) return 0
  return Math.round((b - a) / 86_400_000)
}

export function formatDate(iso: string): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return iso
  return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export interface TripFormValues { title: string; destinationSlug: string; startDate: string; endDate: string; notes: string }

export function validateTrip(v: TripFormValues): Partial<Record<keyof TripFormValues, string>> {
  const errors: Partial<Record<keyof TripFormValues, string>> = {}
  if (!v.title.trim()) errors.title = 'Give your trip a name.'
  if (!v.destinationSlug) errors.destinationSlug = 'Choose a destination.'
  if (!v.startDate) errors.startDate = 'Choose a start date.'
  if (!v.endDate) errors.endDate = 'Choose an end date.'
  if (v.startDate && v.endDate && v.endDate < v.startDate) errors.endDate = 'End date must be on or after the start date.'
  return errors
}
