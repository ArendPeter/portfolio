import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { smoothScrollTo, scrollToFragment } from './scroll'
import type React from 'react'

let rafSpy: ReturnType<typeof vi.spyOn<Window, 'requestAnimationFrame'>>

function makeBoundingClientRect(top: number) {
  return { top, bottom: 0, left: 0, right: 0, height: 0, width: 0, x: 0, y: 0, toJSON: () => '' }
}

beforeEach(() => {
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
  window.scrollTo = vi.fn()
  rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0)
  vi.spyOn(window.performance, 'now').mockReturnValue(0)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('smoothScrollTo', () => {
  it('starts animation via requestAnimationFrame', () => {
    smoothScrollTo(500)
    expect(rafSpy).toHaveBeenCalledOnce()
  })

  it('scrolls to the exact target when progress reaches 1 (duration elapsed)', () => {
    let capturedStep: FrameRequestCallback | null = null
    rafSpy.mockImplementation((cb) => {
      capturedStep = cb
      return 0
    })

    smoothScrollTo(300, 700)

    capturedStep!(700) // elapsed = duration → progress = 1
    expect(window.scrollTo).toHaveBeenCalledWith(0, 300)
  })

  it('uses easing: mid-progress position is between start and target', () => {
    let capturedStep: FrameRequestCallback | null = null
    rafSpy.mockImplementation((cb) => {
      capturedStep = cb
      return 0
    })

    smoothScrollTo(1000, 700)

    capturedStep!(350) // 50% of duration elapsed
    const scrollToMock = vi.mocked(window.scrollTo)
    const y = scrollToMock.mock.calls[0]?.[1]
    expect(y).toBeGreaterThan(0)
    expect(y).toBeLessThan(1000)
  })
})

describe('scrollToFragment', () => {
  it('ignores non-fragment hrefs', () => {
    const preventDefault = vi.fn()
    const e = { preventDefault } as unknown as React.MouseEvent<HTMLAnchorElement>
    scrollToFragment(e, '/about')
    expect(preventDefault).not.toHaveBeenCalled()
    expect(rafSpy).not.toHaveBeenCalled()
  })

  it('calls preventDefault for fragment hrefs', () => {
    const el = document.createElement('div')
    el.id = 'about'
    el.getBoundingClientRect = () => makeBoundingClientRect(200)
    document.body.appendChild(el)

    const preventDefault = vi.fn()
    const e = { preventDefault } as unknown as React.MouseEvent<HTMLAnchorElement>
    scrollToFragment(e, '#about')
    expect(preventDefault).toHaveBeenCalledOnce()

    document.body.removeChild(el)
  })

  it('starts animation when target element exists', () => {
    const el = document.createElement('div')
    el.id = 'portfolio'
    el.getBoundingClientRect = () => makeBoundingClientRect(400)
    document.body.appendChild(el)

    const preventDefault = vi.fn()
    const e = { preventDefault } as unknown as React.MouseEvent<HTMLAnchorElement>
    scrollToFragment(e, '#portfolio')
    expect(rafSpy).toHaveBeenCalledOnce()

    document.body.removeChild(el)
  })

  it('does not start animation when target element is missing', () => {
    const preventDefault = vi.fn()
    const e = { preventDefault } as unknown as React.MouseEvent<HTMLAnchorElement>
    scrollToFragment(e, '#nonexistent')
    expect(rafSpy).not.toHaveBeenCalled()
  })

  it.each([
    { id: 'experience', top: 500, scrollY: 0, expected: 444 }, // 500 + 0   - 56
    { id: 'skills', top: 300, scrollY: 800, expected: 1044 }, // 300 + 800 - 56
  ])(
    'scrolls to top + scrollY - NAV_HEIGHT (scrollY=$scrollY)',
    ({ id, top, scrollY, expected }) => {
      Object.defineProperty(window, 'scrollY', {
        value: scrollY,
        writable: true,
        configurable: true,
      })

      const el = document.createElement('div')
      el.id = id
      el.getBoundingClientRect = () => makeBoundingClientRect(top)
      document.body.appendChild(el)

      let capturedStep: FrameRequestCallback | null = null
      rafSpy.mockImplementation((cb) => {
        capturedStep = cb
        return 0
      })

      const e = { preventDefault: vi.fn() } as unknown as React.MouseEvent<HTMLAnchorElement>
      scrollToFragment(e, `#${id}`)

      capturedStep!(700)
      expect(window.scrollTo).toHaveBeenCalledWith(0, expected)

      document.body.removeChild(el)
    },
  )
})
