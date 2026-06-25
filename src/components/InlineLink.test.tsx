import { render, screen } from '@testing-library/react'
import { InlineLink } from './InlineLink'

describe('InlineLink', () => {
  it('renders children', () => {
    render(<InlineLink href="https://example.com">Visit</InlineLink>)
    expect(screen.getByRole('link', { name: /Visit/ })).toBeInTheDocument()
  })

  it('does not show external icon by default', () => {
    render(<InlineLink href="https://example.com">Visit</InlineLink>)
    expect(screen.getByRole('link').querySelector('svg')).toBeNull()
  })

  it('shows external icon, sets target and rel when external is true', () => {
    render(
      <InlineLink href="https://example.com" external>
        Visit
      </InlineLink>,
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link.querySelector('svg')).toBeTruthy()
  })
})
