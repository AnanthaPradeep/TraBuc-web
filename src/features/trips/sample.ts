import type { Trip } from './types'

/** SAMPLE trips shown so the planner is not empty. They are not tied to an account. */
export const sampleTrips: Trip[] = [
  { id: 'sample-kyoto', title: 'Autumn in Kyoto', destinationSlug: 'kyoto', startDate: '2027-11-08', endDate: '2027-11-15', notes: 'Temples early, day trip to Arashiyama, one kaiseki dinner.', sample: true },
  { id: 'sample-banff', title: 'Banff camping week', destinationSlug: 'banff', startDate: '2027-07-12', endDate: '2027-07-19', notes: 'Check campground booking windows. Pack bear spray rules.', sample: true },
]
