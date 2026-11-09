import { Link, useParams } from 'react-router-dom'
import { getStory, stories } from './data'
import { useDestinations } from '../destinations/DestinationsContext'
import { Media } from '../../components/Media'
import { Badge, ButtonLink, ComingSoonButton, EmptyState, EmptyState as Empty, Notice, PageHeader, SampleBadge } from '../../components/ui'

export function StoriesPage() {
  const { getDestination } = useDestinations()
  return (
    <div className="container section">
      <PageHeader title="Travel stories" intro={<>Read how other travellers experience a place. <SampleBadge /></>}
        actions={<ComingSoonButton>Share a story</ComingSoonButton>} />
      <Notice tone="info">These stories are placeholder content. Publishing and photo uploads are not available yet.</Notice>
      <ul className="card-grid">
        {stories.map((s) => (
          <li key={s.slug}>
            <article className="dest-card"><Link className="dest-card-link" to={`/stories/${s.slug}`}>
              <Media alt={s.title} seed={s.artSeed} />
              <div className="dest-card-body"><h3>{s.title}</h3><p className="muted">{getDestination(s.destinationSlug)?.name} · {s.readMinutes} min read</p><p>{s.excerpt}</p></div>
            </Link></article>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function StoryDetailPage() {
  const { slug = '' } = useParams()
  const { getDestination } = useDestinations()
  const s = getStory(slug)
  if (!s) return <div className="container section"><EmptyState title="Story not found" action={<ButtonLink to="/stories">Back to stories</ButtonLink>} /></div>
  const d = getDestination(s.destinationSlug)
  return (
    <article className="container section story">
      <nav aria-label="Breadcrumb" className="breadcrumb"><Link to="/stories">Stories</Link> <span aria-hidden="true">/</span> <span>{s.title}</span></nav>
      <h1>{s.title}</h1>
      <p className="muted">{s.author} · {s.readMinutes} min read <Badge tone="sample">Sample story</Badge></p>
      <Media alt={s.title} seed={s.artSeed} />
      <div className="prose">{s.body.map((p) => <p key={p}>{p}</p>)}</div>
      {d ? <p>Related place: <Link to={`/discover/${d.slug}`}>{d.name}, {d.country}</Link></p> : null}
    </article>
  )
}

export function MemoriesPage() {
  return (
    <div>
      <PageHeader title="Memories" intro="Photos and notes from your trips will live here." />
      <Empty title="No memories yet">Uploading photos and saving memories is coming soon. When it is ready, your memories will be private to your account by default.</Empty>
      <div className="btn-row"><ComingSoonButton>Add a memory</ComingSoonButton></div>
    </div>
  )
}
