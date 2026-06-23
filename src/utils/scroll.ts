import React from 'react'

// h-14 / scroll-padding-top: 3.5rem = 56px
const NAV_HEIGHT = 56

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function smoothScrollTo(targetY: number, duration = 700) {
  const startY = window.scrollY
  const distance = targetY - startY
  const startTime = performance.now()

  function step(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    window.scrollTo(0, startY + distance * easeInOutCubic(progress))
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

// HashRouter owns the URL hash for routing, so plain #fragment hrefs break navigation.
// Intercept fragment clicks and scroll to the target element instead.
export function scrollToFragment(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith('#')) return
  e.preventDefault()
  const target = document.getElementById(href.slice(1))
  if (!target) return
  const targetY = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT
  smoothScrollTo(targetY)
}
