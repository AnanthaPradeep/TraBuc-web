import { useEffect } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DestinationsProvider, useDestinations, type DestinationsValue } from './DestinationsContext'
import { DestinationsStatus } from './DestinationsStatus'
import { DestinationCard } from './DestinationCard'
import { sampleDestinations } from './data'
import * as api from './destinationsApi'
import type { Destination } from './types'

vi.mock('./destinationsApi', () => ({ listDestinations: vi.fn(), getDestinationBySlug: vi.fn() }))
const mocked = vi.mocked(api)

const live: Destination = { ...sampleDestinations[0], slug: 'live-1', name: 'Live Place', verified: true }

let ctx: DestinationsValue
function Probe() {
  const value = useDestinations()
  useEffect(() => { ctx = value })
  return <p>{value.loading ? 'loading' : `${value.reason ?? 'live'}:${value.destinations.map((d) => d.slug).join(',')}`}</p>
}
function setup(configured: boolean) {
  return render(<DestinationsProvider configured={configured}><Probe /><DestinationsStatus /></DestinationsProvider>)
}

beforeEach(() => { vi.clearAllMocks() })

describe('DestinationsProvider fallback behaviour', () => {
  it('uses sample data and never calls the API when Supabase is not configured', () => {
    setup(false)
    expect(screen.getByText(new RegExp(`^not-configured:${sampleDestinations[0].slug}`))).toBeInTheDocument()
    expect(screen.getByText(/built-in sample destinations/i)).toBeInTheDocument()
    expect(mocked.listDestinations).not.toHaveBeenCalled()
    expect(ctx.destinations).toHaveLength(12)
  })

  it('shows loading, then live data with no sample notice', async () => {
    mocked.listDestinations.mockResolvedValue([live])
    setup(true)
    expect(screen.getAllByText(/loading/i).length).toBeGreaterThan(0)
    await waitFor(() => expect(screen.getByText('live:live-1')).toBeInTheDocument())
    expect(screen.queryByText(/built-in sample/i)).not.toBeInTheDocument()
    expect(ctx.getDestination('live-1')?.name).toBe('Live Place')
  })

  it('falls back to sample data with an error notice, and retry loads live data', async () => {
    mocked.listDestinations.mockRejectedValueOnce(new Error('network down')).mockResolvedValueOnce([live])
    setup(true)
    await waitFor(() => expect(screen.getByText(/could not load live destinations/i)).toBeInTheDocument())
    await waitFor(() => expect(ctx.reason).toBe('error'))
    expect(ctx.destinations).toHaveLength(12)
    expect(screen.getByText(/network down/)).toBeInTheDocument()
    act(() => ctx.retry())
    await waitFor(() => expect(screen.getByText('live:live-1')).toBeInTheDocument())
    expect(mocked.listDestinations).toHaveBeenCalledTimes(2)
  })

  it('falls back to sample data when the table is empty', async () => {
    mocked.listDestinations.mockResolvedValue([])
    setup(true)
    await waitFor(() => expect(screen.getByText(/table is empty/i)).toBeInTheDocument())
    await waitFor(() => expect(ctx.reason).toBe('empty'))
    expect(ctx.destinations).toHaveLength(12)
  })
})

describe('sample data badge', () => {
  const card = (d: Destination) => render(<MemoryRouter><DestinationCard d={d} /></MemoryRouter>)

  it('shows the badge for unverified rows', () => {
    card({ ...live, verified: false })
    expect(screen.getByText('Sample data')).toBeInTheDocument()
  })
  it('hides the badge for verified rows', () => {
    card({ ...live, verified: true })
    expect(screen.queryByText('Sample data')).not.toBeInTheDocument()
  })
  it('marks every built-in sample row as unverified', () => {
    expect(sampleDestinations.every((d) => d.verified === false)).toBe(true)
  })
  it('shows the image credit only when there is an image and a credit', () => {
    const { unmount } = card({ ...live, image: 'https://example.com/a.jpg', imageCredit: 'Photo: A' })
    expect(screen.getByText('Photo: A')).toBeInTheDocument()
    unmount()
    card({ ...live, image: undefined, imageCredit: 'Photo: A' })
    expect(screen.queryByText('Photo: A')).not.toBeInTheDocument()
  })
})
