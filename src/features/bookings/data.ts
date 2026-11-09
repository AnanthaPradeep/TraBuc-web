export interface Experience {
  id: string
  title: string
  destinationSlug: string
  kind: 'Camping' | 'Stay' | 'Tour'
  nights: string
  priceFrom: number
  currency: 'USD'
  description: string
  includes: string[]
  artSeed: number
}

/** SAMPLE experiences. None of these can be booked yet. Prices are illustrative. */
export const experiences: Experience[] = [
  { id: 'banff-lakeside', title: 'Lakeside tent pitch', destinationSlug: 'banff', kind: 'Camping', nights: '2–7 nights', priceFrom: 38, currency: 'USD', description: 'A tent pitch near the water, with shared fire pits and washrooms.', includes: ['Pitch for up to 4 people', 'Fire pit access', 'Shared washrooms'], artSeed: 201 },
  { id: 'wadi-rum-camp', title: 'Desert camp night', destinationSlug: 'wadi-rum', kind: 'Camping', nights: '1–2 nights', priceFrom: 65, currency: 'USD', description: 'A night in a Bedouin-run camp with dinner and breakfast.', includes: ['Dinner and breakfast', 'Bedding', 'Evening fire'], artSeed: 211 },
  { id: 'kyoto-machiya', title: 'Machiya townhouse stay', destinationSlug: 'kyoto', kind: 'Stay', nights: '3–10 nights', priceFrom: 140, currency: 'USD', description: 'A restored wooden townhouse in a quiet residential lane.', includes: ['Private house', 'Kitchenette', 'Walkable to temples'], artSeed: 223 },
  { id: 'lofoten-rorbu', title: 'Fishing cabin (rorbu)', destinationSlug: 'lofoten', kind: 'Stay', nights: '2–7 nights', priceFrom: 170, currency: 'USD', description: 'A red harbour-side cabin with a small kitchen.', includes: ['Harbour view', 'Kitchen', 'Parking'], artSeed: 233 },
  { id: 'cusco-sacred-valley', title: 'Sacred Valley day tour', destinationSlug: 'cusco', kind: 'Tour', nights: '1 day', priceFrom: 55, currency: 'USD', description: 'A small-group day through market towns and ruins.', includes: ['Guide', 'Transport', 'Lunch'], artSeed: 241 },
  { id: 'faroe-hike', title: 'Guided village hike', destinationSlug: 'faroe', kind: 'Tour', nights: '1 day', priceFrom: 90, currency: 'USD', description: 'A guided walk between two villages, with a ferry or road return.', includes: ['Local guide', 'Return transfer'], artSeed: 257 },
]

export interface SampleBooking { id: string; experienceId: string; dates: string; status: 'Example' }

/** One clearly labelled example, so "My bookings" shows what a booking will look like. */
export const sampleBookings: SampleBooking[] = [
  { id: 'example-1', experienceId: 'banff-lakeside', dates: '12–19 Jul 2027', status: 'Example' },
]
