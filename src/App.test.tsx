import { render, screen } from '@testing-library/react'
import App from './App'

vi.mock('react-github-calendar', () => ({
  GitHubCalendar: () => null,
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

  it('renders HomePage at /', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    const selfies = screen.getAllByRole('img', { name: /arend peter/i })
    expect(selfies[0]).toHaveAttribute('src', '/selfie.jpg')
  })

  it('renders Stylebook at /stylebook', () => {
    window.history.pushState({}, '', '/stylebook')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: /stylebook/i })).toBeInTheDocument()
  })
})
