import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SiteNav } from './SiteNav'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SiteNav />
    </MemoryRouter>,
  )
}

describe('SiteNav', () => {
  it('links the name to the Homepage and About Me to /about', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: 'Arend Peter Castelein' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'About Me' })).toHaveAttribute('href', '/about')
  })

  it('has RSS, GitHub and LinkedIn icon links', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: 'RSS feed' })).toHaveAttribute('href', '/rss.xml')
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('target', '_blank')
  })

  it('highlights About Me only on /about', () => {
    renderAt('/about')
    expect(screen.getByRole('link', { name: 'About Me' })).toHaveClass('text-accent')
  })

  it('does not highlight About Me elsewhere', () => {
    renderAt('/blog')
    expect(screen.getByRole('link', { name: 'About Me' })).not.toHaveClass('text-accent')
  })
})
