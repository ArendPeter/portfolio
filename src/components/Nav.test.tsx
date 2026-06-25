import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
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

  it('does not call scrollToFragment when external nav link is clicked', () => {
    const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<Nav siteName="Test" links={[externalNavLink]} />)
    const links = screen.getAllByRole('link', { name: /Resume/ })
    fireEvent.click(links[0])
    expect(windowOpen).toHaveBeenCalledWith(
      '/arend-peter-resume.pdf',
      '_blank',
      'noopener,noreferrer',
    )
    windowOpen.mockRestore()
  })
})
