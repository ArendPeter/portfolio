import { useState } from 'react'

interface NavLink {
  label: string
  href: string
}

interface NavProps {
  siteName: string
  links: NavLink[]
  activeHref?: string
}

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function Nav({ siteName, links, activeHref }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  function linkClass(href: string) {
    return `text-sm transition-colors hover:text-accent ${activeHref === href ? 'text-accent' : 'text-muted'}`
  }

  return (
    <nav className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/" className="font-semibold text-body hover:text-accent transition-colors">
          {siteName}
        </a>

        {/* Desktop links */}
        <ul className="hidden sm:flex gap-6">
          {links.map(({ label, href }) => (
            <li key={href}>
              <a href={href} className={linkClass(href)}>
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex items-center justify-center w-8 h-8 text-body hover:text-accent transition-colors"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-border bg-surface">
          <ul className="max-w-4xl mx-auto px-6 py-3 flex flex-col gap-3">
            {links.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`block ${linkClass(href)}`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
