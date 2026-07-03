import { render, screen } from '@testing-library/react'
import { HomePage } from './HomePage'

vi.mock('react-github-calendar', () => ({
  GitHubCalendar: () => null,
}))

class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

describe('HomePage', () => {
  it('renders a selfie profile image', () => {
    render(<HomePage />)
    const selfies = screen.getAllByRole('img', { name: /arend peter/i })
    expect(selfies[0]).toHaveAttribute('src', '/selfie.jpg')
  })
})
