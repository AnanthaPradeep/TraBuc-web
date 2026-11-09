import type { Destination } from './types'

/** SAMPLE DATA used as the fallback when Supabase is not configured or unavailable. */
const sample: Omit<Destination, 'verified'>[] = [
  { slug: 'kyoto', name: 'Kyoto', country: 'Japan', type: 'City', kind: 'popular', budget: 'Mid-range', bestMonths: [3, 4, 10, 11], lat: 35.01, lng: 135.77, elevation: 50, artSeed: 11,
    summary: 'Temples, tea houses and narrow lanes that reward slow walking.',
    highlights: ['Early-morning temple visits before the crowds', 'Day trip to the Arashiyama bamboo grove', 'Seasonal kaiseki dinners'] },
  { slug: 'lofoten', name: 'Lofoten Islands', country: 'Norway', type: 'Island', kind: 'popular', budget: 'Premium', bestMonths: [6, 7, 8, 2, 3], lat: 68.21, lng: 13.62, elevation: 5, artSeed: 23,
    summary: 'Sharp peaks rising straight out of the sea, with red fishing cabins below.',
    highlights: ['Midnight-sun hikes in summer', 'Northern lights season in late winter', 'Fishing-village stays'] },
  { slug: 'cusco', name: 'Cusco', country: 'Peru', type: 'Mountains', kind: 'popular', budget: 'Mid-range', bestMonths: [5, 6, 7, 8, 9], lat: -13.53, lng: -71.97, elevation: 3399, artSeed: 37,
    summary: 'A high-altitude Andean city and the usual base for the Sacred Valley.',
    highlights: ['Allow two days to adjust to altitude', 'Sacred Valley market towns', 'Multi-day trekking routes'] },
  { slug: 'amalfi', name: 'Amalfi Coast', country: 'Italy', type: 'Coast', kind: 'popular', budget: 'Premium', bestMonths: [5, 6, 9], lat: 40.63, lng: 14.6, elevation: 20, artSeed: 41,
    summary: 'Cliffside villages linked by winding coast roads and ferry hops.',
    highlights: ['Ferries between towns beat the road in summer', 'Path of the Gods walk', 'Lemon-grove lunches'] },
  { slug: 'marrakech', name: 'Marrakech', country: 'Morocco', type: 'City', kind: 'popular', budget: 'Budget', bestMonths: [3, 4, 5, 10, 11], lat: 31.63, lng: -8.0, elevation: 466, artSeed: 53,
    summary: 'A walled medina of souks, courtyards and rooftop cafés.',
    highlights: ['Evening in Jemaa el-Fnaa square', 'Riad stays in the medina', 'Day trips to the Atlas foothills'] },
  { slug: 'banff', name: 'Banff National Park', country: 'Canada', type: 'Mountains', kind: 'popular', budget: 'Mid-range', bestMonths: [6, 7, 8, 9, 1, 2], lat: 51.18, lng: -115.57, elevation: 1383, artSeed: 61,
    summary: 'Turquoise lakes and alpine trails with well-run campgrounds.',
    highlights: ['Lake-side campgrounds (book early)', 'Sunrise at Moraine Lake', 'Winter skiing'] },
  { slug: 'socotra', name: 'Socotra', country: 'Yemen', type: 'Island', kind: 'hidden', budget: 'Premium', bestMonths: [10, 11, 12, 1, 2, 3], lat: 12.5, lng: 53.9, elevation: 0, artSeed: 71,
    summary: 'Remote island known for unusual plants found almost nowhere else. Check current travel advisories before planning.',
    highlights: ['Dragon blood tree plateaus', 'Remote beach camping', 'Check government travel advice first'] },
  { slug: 'faroe', name: 'Faroe Islands', country: 'Denmark', type: 'Island', kind: 'hidden', budget: 'Premium', bestMonths: [6, 7, 8], lat: 62.0, lng: -6.79, elevation: 40, artSeed: 83,
    summary: 'Grass-roofed villages and waterfalls dropping into the Atlantic.',
    highlights: ['Village-to-village hiking', 'Ferry and tunnel road network', 'Fast-changing weather'] },
  { slug: 'wadi-rum', name: 'Wadi Rum', country: 'Jordan', type: 'Desert', kind: 'hidden', budget: 'Budget', bestMonths: [3, 4, 5, 10, 11], lat: 29.57, lng: 35.42, elevation: 900, artSeed: 97,
    summary: 'Red sandstone desert valleys with Bedouin-run camps under clear night skies.',
    highlights: ['Overnight desert camp', 'Jeep or camel tours', 'Stargazing'] },
  { slug: 'plitvice', name: 'Plitvice Lakes', country: 'Croatia', type: 'Forest', kind: 'hidden', budget: 'Budget', bestMonths: [4, 5, 9, 10], lat: 44.88, lng: 15.62, elevation: 600, artSeed: 109,
    summary: 'Terraced lakes joined by boardwalks through beech forest.',
    highlights: ['Arrive at opening to beat tour groups', 'Boardwalk loops of varied length', 'Autumn colours'] },
  { slug: 'hokkaido-shiretoko', name: 'Shiretoko Peninsula', country: 'Japan', type: 'Forest', kind: 'hidden', budget: 'Mid-range', bestMonths: [6, 7, 8, 9], lat: 44.1, lng: 145.1, elevation: 300, artSeed: 127,
    summary: 'Wild northern coastline with hot-spring streams and marine wildlife.',
    highlights: ['Coastal boat trips', 'Guided forest walks', 'Remote onsen'] },
  { slug: 'gili-air', name: 'Gili Air', country: 'Indonesia', type: 'Island', kind: 'hidden', budget: 'Budget', bestMonths: [5, 6, 7, 8, 9], lat: -8.35, lng: 116.08, elevation: 3, artSeed: 139,
    summary: 'A car-free island small enough to walk around in an hour or two.',
    highlights: ['Snorkelling off the beach', 'Bicycles and horse carts only', 'Sunset-side cafés'] },
]

/** Every built-in row is placeholder content, so none are verified. */
export const sampleDestinations: Destination[] = sample.map((d) => ({ ...d, verified: false }))
export const destinations = sampleDestinations

export const getDestination = (slug: string) => sampleDestinations.find((d) => d.slug === slug)
