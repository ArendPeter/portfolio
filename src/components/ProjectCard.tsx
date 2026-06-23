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
}

export function ProjectCard({
  name,
  role,
  hook,
  stack,
  links,
  screenshotSrc,
  screenshotAlt,
}: ProjectCardProps) {
  return (
    <div className="bg-surface border border-border rounded-lg flex flex-col">
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold mb-3">{name}</h3>

        <div className="aspect-video w-full rounded-md overflow-hidden mb-3">
          {screenshotSrc ? (
            <img
              src={screenshotSrc}
              alt={screenshotAlt ?? name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-border flex items-center justify-center">
              <span className="text-sm text-muted">Screenshot</span>
            </div>
          )}
        </div>

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
              {label} →
            </InlineLink>
          ))}
        </div>
      </div>
    </div>
  )
}
