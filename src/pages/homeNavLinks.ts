// Unused: the old section nav, replaced by SiteNav. Kept for reference in case it comes back.
import type { NavLink } from '../components/Nav'

export const navLinks: NavLink[] = [
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Resume', href: '#resume', external: true, externalHref: '/arend-peter-resume.pdf' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills', href: '#skills' },
  { label: 'GitHub', href: '#github' },
  { label: 'Contact', href: '#contact' },
]
