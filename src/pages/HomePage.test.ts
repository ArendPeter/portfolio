import { describe, it, expect } from 'vitest'
import { navLinks } from './homeNavLinks'

describe('navLinks', () => {
  it('does not include an Impact entry', () => {
    expect(navLinks.some((l) => l.label === 'Impact')).toBe(false)
  })
})
