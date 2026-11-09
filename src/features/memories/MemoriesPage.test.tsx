import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext, type AuthValue } from '../auth/AuthContext'
import { TripsProvider } from '../trips/TripsContext'
import { MemoriesPage } from './MemoriesPage'
import * as api from './memoriesApi'
import type { Memory } from './memoriesApi'

vi.mock('./memoriesApi', () => ({
  listMemories: vi.fn(), createMemory: vi.fn(), updateMemory: vi.fn(), removeMemory: vi.fn(),
  uploadPhoto: vi.fn(), deletePhoto: vi.fn(), getSignedUrl: vi.fn(),
  rowToMemory: vi.fn(), valuesToPayload: vi.fn(),
}))
vi.mock('../trips/tripsApi', () => ({ listTrips: vi.fn(async () => []), createTrip: vi.fn(), updateTrip: vi.fn(), removeTrip: vi.fn() }))
vi.mock('./useSignedUrl', () => ({ useSignedUrl: () => ({ url: undefined, onImageError: () => undefined }) }))

const mocked = vi.mocked(api)
const USER = '123e4567-e89b-12d3-a456-426614174000'
const memory: Memory = { id: 'm1', title: 'Sunrise', note: 'Cold and bright', photoPath: `${USER}/a.jpg`, takenOn: '2027-03-09', createdAt: '2027-03-10T00:00:00Z' }

const base: AuthValue = {
  configured: true, loading: false, session: null, user: null,
  signUp: async () => ({ error: null }), signIn: async () => ({ error: null }), signOut: async () => ({ error: null }),
  sendPasswordReset: async () => ({ error: null }), updatePassword: async () => ({ error: null }),
}
const signedIn: AuthValue = { ...base, user: { id: USER, email: 'a@b.co' } as AuthValue['user'] }

function setup(auth: AuthValue) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter><TripsProvider><MemoriesPage /></TripsProvider></MemoryRouter>
    </AuthContext.Provider>,
  )
}

// jsdom has no <dialog>.showModal(); emulate it so dialog contents are visible to user-event.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function close() { this.removeAttribute('open'); this.dispatchEvent(new Event('close')) }
})

beforeEach(() => { vi.clearAllMocks() })

describe('MemoriesPage when memories cannot be saved', () => {
  it('is honest when Supabase is not configured: no upload controls, no API calls', () => {
    setup({ ...base, configured: false })
    expect(screen.getByText(/not available yet/i)).toBeInTheDocument()
    expect(screen.getByText(/uploads are turned off/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/photo/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add a memory/i })).not.toBeInTheDocument()
    expect(mocked.listMemories).not.toHaveBeenCalled()
  })

  it('asks signed-out visitors to sign in, with no upload controls', () => {
    setup(base)
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.queryByLabelText(/photo/i)).not.toBeInTheDocument()
    expect(mocked.listMemories).not.toHaveBeenCalled()
  })
})

describe('MemoriesPage when signed in', () => {
  it('shows loading, then the saved memories', async () => {
    mocked.listMemories.mockResolvedValue([memory])
    setup(signedIn)
    expect(screen.getByText(/loading your memories/i)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Sunrise' })).toBeInTheDocument()
    expect(screen.getByText('Cold and bright')).toBeInTheDocument()
  })

  it('shows an empty state', async () => {
    mocked.listMemories.mockResolvedValue([])
    setup(signedIn)
    expect(await screen.findByText('No memories yet')).toBeInTheDocument()
  })

  it('shows an error with retry', async () => {
    mocked.listMemories.mockRejectedValueOnce(new Error('network down')).mockResolvedValueOnce([memory])
    setup(signedIn)
    expect(await screen.findByText(/network down/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(await screen.findByRole('heading', { name: 'Sunrise' })).toBeInTheDocument()
  })

  it('uploads a valid photo, then creates the memory with the returned path', async () => {
    mocked.listMemories.mockResolvedValue([])
    mocked.uploadPhoto.mockResolvedValue(`${USER}/new.jpg`)
    mocked.createMemory.mockResolvedValue({ ...memory, id: 'm2', title: 'Beach', photoPath: `${USER}/new.jpg` })
    setup(signedIn)
    await screen.findByText('No memories yet')
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /add your first memory/i }))
    await user.type(screen.getByLabelText('Title'), 'Beach')
    const file = new File(['abc'], 'beach.jpg', { type: 'image/jpeg' })
    await user.upload(screen.getByLabelText(/^Photo/), file)
    await user.click(screen.getByRole('button', { name: 'Add memory', hidden: true }))
    await waitFor(() => expect(mocked.createMemory).toHaveBeenCalled())
    expect(mocked.uploadPhoto).toHaveBeenCalledWith(USER, file)
    expect(mocked.createMemory.mock.calls[0][1]).toBe(`${USER}/new.jpg`)
    expect(await screen.findByRole('heading', { name: 'Beach' })).toBeInTheDocument()
  })

  it('rejects a wrong file type or an oversized file with a message, and does not upload', async () => {
    mocked.listMemories.mockResolvedValue([])
    setup(signedIn)
    await screen.findByText('No memories yet')
    const user = userEvent.setup({ applyAccept: false })
    const input = screen.getByLabelText(/^Photo/)
    await user.upload(input, new File(['x'], 'a.gif', { type: 'image/gif' }))
    expect(await screen.findByText(/JPEG, PNG or WebP/, { selector: '.field-error' })).toBeInTheDocument()
    const big = new File(['x'], 'big.jpg', { type: 'image/jpeg' })
    Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 })
    await user.upload(input, big)
    expect(await screen.findByText(/5 MB or smaller/)).toBeInTheDocument()
    await user.type(screen.getByLabelText('Title'), 'x')
    await user.click(screen.getByRole('button', { name: 'Add memory', hidden: true }))
    expect(mocked.uploadPhoto).not.toHaveBeenCalled()
    expect(mocked.createMemory).not.toHaveBeenCalled()
  })

  it('deletes a memory and its photo after confirmation', async () => {
    mocked.listMemories.mockResolvedValue([memory])
    mocked.removeMemory.mockResolvedValue()
    mocked.deletePhoto.mockResolvedValue()
    setup(signedIn)
    await screen.findByRole('heading', { name: 'Sunrise' })
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /delete/i }))
    const confirm = screen.getByRole('button', { name: 'Delete memory', hidden: true })
    expect(within(confirm.closest('dialog') as HTMLElement).getByText(/along with its photo/i)).toBeInTheDocument()
    await user.click(confirm)
    await waitFor(() => expect(mocked.removeMemory).toHaveBeenCalledWith('m1'))
    expect(mocked.deletePhoto).toHaveBeenCalledWith(`${USER}/a.jpg`)
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Sunrise' })).not.toBeInTheDocument())
  })
})
