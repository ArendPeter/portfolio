import { useRef } from 'react'
import { InlineLink } from './InlineLink'

interface ProjectLink {
  label: string
  href: string
}

interface ProjectCardProps {
  name: string
  role: string
  hook: string
  stack: string[]
  links: ProjectLink[]
  screenshotSrc?: string
  screenshotAlt?: string
  videoSrc?: string
}

export function ProjectCard({
  name,
  role,
  hook,
  stack,
  links,
  screenshotSrc,
  screenshotAlt,
  videoSrc,
}: ProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  function handleMouseEnter() {
    void videoRef.current?.play()
  }

  function handleMouseLeave() {
    videoRef.current?.pause()
  }

  function renderMedia() {
    if (videoSrc) {
      return (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={screenshotSrc}
          muted
          loop
          playsInline
          preload="none"
          className="w-full h-full object-cover"
        />
      )
    }
    if (screenshotSrc) {
      return (
        <img
          src={screenshotSrc}
          alt={screenshotAlt ?? name}
          className="w-full h-full object-cover"
        />
      )
    }
    return (
      <div className="w-full h-full bg-border flex items-center justify-center">
        <span className="text-sm text-muted">Screenshot</span>
      </div>
    )
  }

  return (
    <div
      role="article"
      className="bg-surface border border-border rounded-lg p-5 flex flex-col transition-all duration-200 hover:border-accent/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40 cursor-default"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h3 className="text-xl font-bold mb-3">{name}</h3>

      <div className="aspect-video w-full rounded-md overflow-hidden mb-3">{renderMedia()}</div>

      <p className="text-sm text-muted mb-2">{role}</p>
      <p className="text-sm leading-relaxed mb-4 flex-1">{hook}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {stack.map((tag) => (
          <span key={tag} className="text-xs text-muted bg-border rounded-md px-2 py-1">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        {links.map(({ label, href }) => (
          <InlineLink key={href} href={href} external>
            {label}
          </InlineLink>
        ))}
      </div>
    </div>
  )
}
