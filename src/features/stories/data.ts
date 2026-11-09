export interface Story {
  slug: string
  title: string
  author: string
  destinationSlug: string
  readMinutes: number
  excerpt: string
  body: string[]
  artSeed: number
}

/** SAMPLE stories, written as placeholders. Not real traveller content. */
export const stories: Story[] = [
  { slug: 'three-days-in-the-medina', title: 'Three days lost in the medina', author: 'Sample author', destinationSlug: 'marrakech', readMinutes: 4, artSeed: 301,
    excerpt: 'Getting lost was the plan. Here is what a slow, unplanned medina visit looked like.',
    body: ['This is sample content that shows how a story will read. It is not a real traveller account.', 'The first morning was spent following the smell of bread rather than the map. By the third day the lanes had started to feel familiar.', 'A good habit: pick one landmark, set a loose time to be back, and let everything between be unplanned.'] },
  { slug: 'sunrise-at-moraine-lake', title: 'Sunrise at Moraine Lake', author: 'Sample author', destinationSlug: 'banff', readMinutes: 3, artSeed: 311,
    excerpt: 'An early start, a cold thermos and a short walk to a view that justified both.',
    body: ['This is sample content that shows how a story will read.', 'Getting there early meant a quiet shoreline and still water. Bring layers, even in summer.', 'Afterwards, breakfast at camp tasted better than it had any right to.'] },
  { slug: 'island-without-cars', title: 'The island without cars', author: 'Sample author', destinationSlug: 'gili-air', readMinutes: 5, artSeed: 321,
    excerpt: 'Bicycles, horse carts and a coastline you can circle before lunch.',
    body: ['This is sample content that shows how a story will read.', 'With no engines, the soundtrack is waves and bicycle bells.', 'Walk the whole coast once, then pick a favourite stretch of beach and stay put.'] },
]

export const getStory = (slug: string) => stories.find((s) => s.slug === slug)
