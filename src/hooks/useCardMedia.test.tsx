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

  it('preserves currentTime after deactivation instead of resetting', () => {
    const { rerender } = setup(false)
    rerender({ active: true })
    rerender({ active: false })
    videoEl.currentTime = 2.5
    act(() => vi.advanceTimersByTime(FADE_DURATION_MS))
    expect(videoEl.currentTime).toBe(2.5)
  })

  it('reactivation resumes playback from the preserved currentTime', () => {
    const { rerender } = setup(false)
    rerender({ active: true })
    rerender({ active: false })
    videoEl.currentTime = 2.5

    rerender({ active: true })

    expect(videoEl.currentTime).toBe(2.5)
    expect(playMock).toHaveBeenCalledTimes(2)
  })

  it('ended event while inactive triggers deactivation: showVideo false, pause(), then reset', () => {
    const { result, rerender } = setup(false)
    rerender({ active: true })
    rerender({ active: false }) // deactivate before ended fires

    act(() => {
      videoEl.dispatchEvent(new Event('ended'))
    })

    expect(result.current.showVideo).toBe(false)
    expect(pauseMock).toHaveBeenCalled()

    videoEl.currentTime = 3.0
    act(() => vi.advanceTimersByTime(FADE_DURATION_MS))
    expect(videoEl.currentTime).toBe(0)
  })

  it('when ended while still active, video loops: resets currentTime and plays again', () => {
    const { result, rerender } = setup(false)
    rerender({ active: true })
    expect(result.current.showVideo).toBe(true)
    expect(playMock).toHaveBeenCalledTimes(1)

    videoEl.currentTime = 5.0
    act(() => {
      videoEl.dispatchEvent(new Event('ended'))
    })

    expect(result.current.showVideo).toBe(true)
    expect(videoEl.currentTime).toBe(0)
    expect(playMock).toHaveBeenCalledTimes(2)
  })
})
