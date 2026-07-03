import { renderHook, act } from '@testing-library/react'
import { useCardMedia, FADE_DURATION_MS } from './useCardMedia'

describe('useCardMedia', () => {
  let videoEl: HTMLVideoElement
  let playMock: ReturnType<typeof vi.fn>
  let pauseMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    videoEl = document.createElement('video')
    document.body.appendChild(videoEl)
    playMock = vi.fn().mockResolvedValue(undefined)
    pauseMock = vi.fn()
    videoEl.play = playMock
    videoEl.pause = pauseMock
  })

  afterEach(() => {
    document.body.removeChild(videoEl)
    vi.useRealTimers()
  })

  function setup(isActive: boolean) {
    const ref = { current: videoEl }
    return renderHook(({ active }) => useCardMedia(active, ref), {
      initialProps: { active: isActive },
    })
  }

  it('starts with showVideo false when isActive is false', () => {
    const { result } = setup(false)
    expect(result.current.showVideo).toBe(false)
  })

  it('activation sets showVideo true and calls play()', () => {
    const { result, rerender } = setup(false)
    rerender({ active: true })
    expect(result.current.showVideo).toBe(true)
    expect(playMock).toHaveBeenCalledTimes(1)
  })

  it('deactivation sets showVideo false and calls pause() immediately', () => {
    const { result, rerender } = setup(false)
    rerender({ active: true }) // activate
    rerender({ active: false }) // deactivate
    expect(result.current.showVideo).toBe(false)
    expect(pauseMock).toHaveBeenCalledTimes(1)
  })

  it('resets currentTime to 0 after the fade delay following deactivation', () => {
    const { rerender } = setup(false)
    rerender({ active: true })
    rerender({ active: false })
    videoEl.currentTime = 2.5
    act(() => vi.advanceTimersByTime(FADE_DURATION_MS))
    expect(videoEl.currentTime).toBe(0)
  })

  it('cancels pending reset when re-activated before fade delay elapses', () => {
    const { rerender } = setup(false)
    rerender({ active: true })
    rerender({ active: false })
    videoEl.currentTime = 2.5

    act(() => vi.advanceTimersByTime(FADE_DURATION_MS - 50))

    // Re-activate before timer fires
    rerender({ active: true })

    // Advance past where reset would have fired
    act(() => vi.advanceTimersByTime(200))

    // currentTime should NOT have been reset
    expect(videoEl.currentTime).toBe(2.5)
  })

  it('ended event triggers deactivation: showVideo false, pause(), then reset', () => {
    const { result, rerender } = setup(false)
    rerender({ active: true })
    expect(result.current.showVideo).toBe(true)

    act(() => {
      videoEl.dispatchEvent(new Event('ended'))
    })

    expect(result.current.showVideo).toBe(false)
    expect(pauseMock).toHaveBeenCalled()

    videoEl.currentTime = 3.0
    act(() => vi.advanceTimersByTime(FADE_DURATION_MS))
    expect(videoEl.currentTime).toBe(0)
  })

  it('ended event fires deactivation regardless of isActive prop', () => {
    const { result, rerender } = setup(false)
    rerender({ active: true })

    // Simulate ended while still hovered (isActive stays true)
    act(() => {
      videoEl.dispatchEvent(new Event('ended'))
    })

    // showVideo should be false even though isActive is still true
    expect(result.current.showVideo).toBe(false)
  })
})
