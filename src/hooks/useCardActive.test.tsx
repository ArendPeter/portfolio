import { renderHook, act } from '@testing-library/react'
import { useCardActive } from './useCardActive'

// Stub IntersectionObserver
let observerCallback: IntersectionObserverCallback | null = null
let observedElements: Element[] = []

const mockObserve = vi.fn((el: Element) => observedElements.push(el))
const mockUnobserve = vi.fn()
const mockDisconnect = vi.fn()

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback
  }
  observe = mockObserve
  unobserve = mockUnobserve
  disconnect = mockDisconnect
}

// Helper to simulate an intersection event
function triggerIntersection(el: Element, isIntersecting: boolean) {
  observerCallback?.(
    [{ target: el, isIntersecting } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  )
}

describe('useCardActive', () => {
  let cardEl: HTMLDivElement

  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    observerCallback = null
    observedElements = []
    mockObserve.mockClear()
    mockUnobserve.mockClear()
    mockDisconnect.mockClear()
    cardEl = document.createElement('div')
    document.body.appendChild(cardEl)
  })

  afterEach(() => {
    document.body.removeChild(cardEl)
    vi.unstubAllGlobals()
  })

  it('starts with isActive false', () => {
    const ref = { current: cardEl }
    const { result } = renderHook(() => useCardActive(ref))
    expect(result.current.isActive).toBe(false)
  })

  it('onMouseEnter sets isActive true, onMouseLeave sets it false', () => {
    const ref = { current: cardEl }
    const { result } = renderHook(() => useCardActive(ref))

    act(() => result.current.onMouseEnter())
    expect(result.current.isActive).toBe(true)

    act(() => result.current.onMouseLeave())
    expect(result.current.isActive).toBe(false)
  })

  it('centered trigger activates only on hover:none devices', () => {
    // Simulate a touch device — matchMedia('(hover: none)') returns true
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(hover: none)',
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }))

    const ref = { current: cardEl }
    const { result } = renderHook(() => useCardActive(ref))

    // IntersectionObserver should have been set up and the element observed
    expect(mockObserve).toHaveBeenCalledWith(cardEl)

    act(() => triggerIntersection(cardEl, true))
    expect(result.current.isActive).toBe(true)

    act(() => triggerIntersection(cardEl, false))
    expect(result.current.isActive).toBe(false)
  })

  it('centered trigger is inert on hover-capable devices', () => {
    // Simulate a desktop device — matchMedia('(hover: none)') returns false
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }))

    const ref = { current: cardEl }
    const { result } = renderHook(() => useCardActive(ref))

    // Even if an intersection event fires, isActive should stay false
    act(() => triggerIntersection(cardEl, true))
    expect(result.current.isActive).toBe(false)
  })

  it('disconnects observer on unmount', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(hover: none)',
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }))

    const ref = { current: cardEl }
    const { unmount } = renderHook(() => useCardActive(ref))
    unmount()
    expect(mockDisconnect).toHaveBeenCalled()
  })
})
