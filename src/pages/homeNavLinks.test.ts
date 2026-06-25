import { describe, it, expect } from 'vitest'
import { navLinks } from './homeNavLinks'

describe('navLinks', () => {
  it('does not include an Impact entry', () => {
    expect(navLinks.some((l) => l.label === 'Impact')).toBe(false)
  })

  it('includes a Resume entry between About and Experience', () => {
    const aboutIdx = navLinks.findIndex((l) => l.label === 'About')
    const resumeIdx = navLinks.findIndex((l) => l.label === 'Resume')
    const experienceIdx = navLinks.findIndex((l) => l.label === 'Experience')
    expect(resumeIdx).toBeGreaterThan(aboutIdx)
    expect(resumeIdx).toBeLessThan(experienceIdx)
  })

  it('Resume entry has correct href, external, and externalHref values', () => {
    const resume = navLinks.find((l) => l.label === 'Resume')
    expect(resume).toBeDefined()
    expect(resume?.href).toBe('#resume')
    expect((resume as { external?: boolean })?.external).toBe(true)
    expect((resume as { externalHref?: string })?.externalHref).toBe('/arend-peter-resume.pdf')
  })
})
