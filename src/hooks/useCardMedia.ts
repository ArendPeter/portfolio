import { useEffect, useRef, useState } from 'react'

export const FADE_DURATION_MS = 400

export function useCardMedia(
  isActive: boolean,
  videoRef: React.RefObject<HTMLVideoElement | null>,
): { showVideo: boolean } {
  const [showVideo, setShowVideo] = useState(isActive)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  function cancelReset() {
    if (resetTimerRef.current !== null) {
      clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
  }

  function scheduleReset() {
    resetTimerRef.current = setTimeout(() => {
      if (videoRef.current) videoRef.current.currentTime = 0
    }, FADE_DURATION_MS)
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (isActive) {
      cancelReset()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowVideo(true)
      void videoRef.current?.play()
    } else {
      setShowVideo(false)
      videoRef.current?.pause()
      scheduleReset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    function handleEnded() {
      setShowVideo(false)
      video!.pause()
      scheduleReset()
    }

    video.addEventListener('ended', handleEnded)
    return () => video.removeEventListener('ended', handleEnded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { showVideo }
}
