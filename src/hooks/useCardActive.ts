import { useEffect, useState } from 'react'

export function useCardActive(ref: React.RefObject<Element | null>) {
  const [hovered, setHovered] = useState(false)
  const [centered, setCentered] = useState(false)

  useEffect(() => {
    if (!window.matchMedia('(hover: none)').matches) return

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setCentered(entry.isIntersecting)
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  const onMouseEnter = () => setHovered(true)
  const onMouseLeave = () => setHovered(false)

  return {
    isActive: hovered || centered,
    onMouseEnter,
    onMouseLeave,
  }
}
