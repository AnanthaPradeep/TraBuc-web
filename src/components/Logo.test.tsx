import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Logo } from './Logo'

function setup() {
  return render(<MemoryRouter><Logo /></MemoryRouter>)
}

describe('Logo', () => {
  it('is a link home with the accessible name "TRABUC home"', () => {
    setup()
    const link = screen.getByRole('link', { name: 'TRABUC home' })
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders light and dark images, which are decorative because the link has the name', () => {
    const { container } = setup()
    const imgs = container.querySelectorAll('img.logo-img')
    expect(imgs).toHaveLength(2)
    imgs.forEach((i) => expect(i).toHaveAttribute('alt', ''))
    expect(container.querySelector('.logo-img-light')).toBeInTheDocument()
    expect(container.querySelector('.logo-img-dark')).toBeInTheDocument()
  })

  it('falls back to the text name when an image fails to load', () => {
    const { container } = setup()
    fireEvent.error(container.querySelector('.logo-img-light') as Element)
    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(screen.getByText('TRABUC')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'TRABUC home' })).toBeInTheDocument()
  })
})
