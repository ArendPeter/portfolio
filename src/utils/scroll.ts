import React from 'react'

// HashRouter owns the URL hash for routing, so plain #fragment hrefs break navigation.
// Intercept fragment clicks and scroll to the target element instead.
export function scrollToFragment(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith('#')) return
  e.preventDefault()
  document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
}
