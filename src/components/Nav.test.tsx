import { render, screen } from '@testing-library/react'
import { Nav } from './Nav'

const internalLinks = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
]

const externalNavLink = {
  label: 'Resume',
  href: '#resume',
  external: true as const,
  externalHref: '/arend-peter-resume.pdf',
}

describe('Nav', () => {
  it('renders site name and nav links', () => {
    render(<Nav siteName="Test Site" links={internalLinks} />)
    expect(screen.getByText('Test Site')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'About' })).toHaveLength(1)
  })

  it('renders external nav link with target, rel, and SVG icon', () => {
    render(<Nav siteName="Test" links={[externalNavLink]} />)
    const links = screen.getAllByRole('link', { name: /Resume/ })
    expect(links.length).toBeGreaterThan(0)
    const desktopLink = links[0]
    expect(desktopLink).toHaveAttribute('target', '_blank')
    expect(desktopLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(desktopLink.querySelector('svg')).toBeTruthy()
  })

  it('external nav link href points to externalHref so center-click opens the correct URL', () => {
    render(<Nav siteName="Test" links={[externalNavLink]} />)
    const links = screen.getAllByRole('link', { name: /Resume/ })
    expect(links[0]).toHaveAttribute('href', '/arend-peter-resume.pdf')
  })
})
