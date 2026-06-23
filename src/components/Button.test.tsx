import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders as a button element by default', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('renders as an anchor when href is provided', () => {
    render(<Button href="https://example.com">Visit</Button>)
    const link = screen.getByRole('link', { name: 'Visit' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('shows external link icon, sets target and rel when external is true', () => {
    render(
      <Button href="https://example.com" external>
        External
      </Button>,
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link.querySelector('svg')).toBeTruthy()
  })

  it('does not show external icon on a regular button', () => {
    render(<Button>Normal</Button>)
    expect(screen.getByRole('button').querySelector('svg')).toBeNull()
  })

  it('does not show external icon on an internal link', () => {
    render(<Button href="#about">Anchor</Button>)
    expect(screen.getByRole('link').querySelector('svg')).toBeNull()
  })

  it('applies primary variant classes by default', () => {
    render(<Button>Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-accent')
  })

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('border-accent')
  })
})
