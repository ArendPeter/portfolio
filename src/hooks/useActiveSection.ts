import { useEffect, useState } from 'react'

export function useActiveSection(sectionIds: string[]): string | undefined {
  const [activeId, setActiveId] = useState<string | undefined>(sectionIds[0])

  useEffect(() => {
    const visible = new Set<string>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id)
          } else {
            visible.delete(entry.target.id)
          }
        }
        // Pick the topmost (first in document order) visible section
        const active = sectionIds.find((id) => visible.has(id))
        if (active !== undefined) setActiveId(active)
      },
      // Trigger zone: narrow band 10–25% from top of viewport
      { rootMargin: '-10% 0px -75% 0px' },
    )

    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [sectionIds])

  return activeId
}
