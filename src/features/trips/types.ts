export interface Trip {
  id: string
  title: string
  destinationSlug: string
  startDate: string
  endDate: string
  notes: string
  /** True for the built-in examples. */
  sample?: boolean
}
