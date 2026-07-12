import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectCard } from './ProjectCard'

const baseProps = {
  name: 'Test Project',
  role: 'Solo Developer',
  description: 'A test project.',
  stack: ['React'],
  links: [{ label: 'Live Site', href: 'https://example.com' }],
}

describe('ProjectCard', () => {
  it('applies hover transition classes for visual feedback', () => {
    render(<ProjectCard {...baseProps} />)
    const card = screen.getByRole('article')
    expect(card).toHaveClass('hover:border-accent/50')
    expect(card).toHaveClass('transition-all')
  })

  it('renders a video element when videoSrc is provided', () => {
    render(<ProjectCard {...baseProps} videoSrc="project.mp4" />)
    const video = document.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('src', 'project.mp4')
  })

  it('does not render a video element when videoSrc is absent', () => {
    render(<ProjectCard {...baseProps} />)
    expect(document.querySelector('video')).toBeNull()
  })

  it('video element is muted and does not loop', () => {
    render(<ProjectCard {...baseProps} videoSrc="project.mp4" />)
    const video = document.querySelector('video') as HTMLVideoElement
    expect(video.muted).toBe(true)
    expect(video).not.toHaveAttribute('loop')
  })

  it('uses screenshotSrc as video poster when both are provided', () => {
    render(<ProjectCard {...baseProps} videoSrc="project.mp4" screenshotSrc="screenshot.png" />)
    const video = document.querySelector('video')
    expect(video).toHaveAttribute('poster', 'screenshot.png')
  })

  it('renders screenshot image when screenshotSrc is provided and no videoSrc', () => {
    render(<ProjectCard {...baseProps} screenshotSrc="screenshot.png" screenshotAlt="Test Alt" />)
    const img = screen.getByRole('img', { name: 'Test Alt' })
    expect(img).toHaveAttribute('src', 'screenshot.png')
    expect(document.querySelector('video')).toBeNull()
  })

  it('renders both screenshot img and video layers when both screenshotSrc and videoSrc are provided', () => {
    render(
      <ProjectCard
        {...baseProps}
        screenshotSrc="screenshot.png"
        screenshotAlt="Test Alt"
        videoSrc="project.mp4"
      />,
    )
    const img = screen.getByRole('img', { name: 'Test Alt' })
    expect(img).toHaveAttribute('src', 'screenshot.png')
    const video = document.querySelector('video')
    expect(video).toBeInTheDocument()
  })

  it('renders inline markdown links in description as anchor elements', () => {
    render(
      <ProjectCard
        {...baseProps}
        description="Check out [my site](https://example.com/site) for more."
      />,
    )
    const link = screen.getByRole('link', { name: /my site/i })
    expect(link).toHaveAttribute('href', 'https://example.com/site')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders plain description text without any anchor elements', () => {
    render(<ProjectCard {...baseProps} description="No links here." />)
    expect(screen.queryByRole('link', { name: /no links/i })).toBeNull()
    expect(screen.getByText('No links here.')).toBeInTheDocument()
  })

  it('plays video on mouse enter and pauses on mouse leave', () => {
    const playMock = vi.fn().mockResolvedValue(undefined)
    const pauseMock = vi.fn()
    HTMLVideoElement.prototype.play = playMock
    HTMLVideoElement.prototype.pause = pauseMock

    render(<ProjectCard {...baseProps} videoSrc="project.mp4" />)
    const card = screen.getByRole('article')

    fireEvent.mouseEnter(card)
    expect(playMock).toHaveBeenCalledTimes(1)

    fireEvent.mouseLeave(card)
    expect(pauseMock).toHaveBeenCalledTimes(1)
  })
})
