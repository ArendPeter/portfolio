import type { NavLink } from '../components/Nav'

export const navLinks: NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Resume', href: '#resume', external: true, externalHref: '/arend-peter-resume.pdf' },
  { label: 'Experience', href: '#experience' },
  { label: 'GitHub', href: '#github' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
]
