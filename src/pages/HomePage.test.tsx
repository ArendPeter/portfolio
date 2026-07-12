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

  it('renders IELTS Boost card with screenshot and video', () => {
    render(<HomePage />)
    const img = screen.getByRole('img', { name: /ielts boost/i })
    expect(img).toHaveAttribute('src', '/ieltsboost-screenshot.png')
    const ieltsVideo = document.querySelector('video[src="/ieltsboost-video.mp4"]')
    expect(ieltsVideo).toBeInTheDocument()
  })
})
