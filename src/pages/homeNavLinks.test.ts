import { describe, it, expect } from 'vitest'
import { navLinks } from './homeNavLinks'

describe('navLinks', () => {
  it('does not include an Impact entry', () => {
    expect(navLinks.some((l) => l.label === 'Impact')).toBe(false)
  })

  it('includes a GitHub entry with href #github between Experience and Skills', () => {
    const labels = navLinks.map((l) => l.label)
    const experienceIdx = labels.indexOf('Experience')
    const githubIdx = labels.indexOf('GitHub')
    const skillsIdx = labels.indexOf('Skills')

    expect(githubIdx).toBeGreaterThan(-1)
    expect(navLinks[githubIdx].href).toBe('#github')
    expect(githubIdx).toBeGreaterThan(experienceIdx)
    expect(githubIdx).toBeLessThan(skillsIdx)
  })
})
