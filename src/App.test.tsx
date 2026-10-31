import { render, screen } from '@testing-library/react'
import App from './App'

vi.mock('react-github-calendar', () => ({
  GitHubCalendar: () => null,
}))

vi.mock('virtual:posts', () => ({
  posts: [],
  getPostHtml: vi.fn().mockResolvedValue(null),
}))

class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

describe('App routing', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('renders the Blog Index as the Homepage at /', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: /hi i'm arend/i })).toBeInTheDocument()
  })

  it('renders AboutPage at /about', () => {
    window.history.pushState({}, '', '/about')
    render(<App />)
    const selfies = screen.getAllByRole('img', { name: /arend peter/i })
    expect(selfies[0]).toHaveAttribute('src', '/selfie.jpg')
  })

  it('renders Stylebook at /stylebook', () => {
    window.history.pushState({}, '', '/stylebook')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: /stylebook/i })).toBeInTheDocument()
  })

  it('renders BlogIndex at /blog', () => {
    window.history.pushState({}, '', '/blog')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: /hi i'm arend/i })).toBeInTheDocument()
  })
})
