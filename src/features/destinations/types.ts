export type DestinationType = 'Mountains' | 'Coast' | 'City' | 'Desert' | 'Forest' | 'Island'
export type Budget = 'Budget' | 'Mid-range' | 'Premium'

export interface Destination {
  slug: string
  name: string
  country: string
  type: DestinationType
  kind: 'popular' | 'hidden'
  budget: Budget
  /** Months (1-12) when conditions are generally best. Sample data. */
  bestMonths: number[]
  lat: number
  lng: number
  /** Approximate elevation in metres. */
  elevation: number
  summary: string
  highlights: string[]
  /** Optional photo. Keep licence/credit in imageCredit. Falls back to generated art. */
  image?: string
  imageCredit?: string
  imageLicense?: string
  /** False for placeholder content that has not been reviewed. The UI shows a "Sample data" badge. */
  verified: boolean
  /** Seed used for the generated fallback artwork. */
  artSeed: number
}
