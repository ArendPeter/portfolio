// PROTOTYPE — throwaway. Floating variant switcher for UI prototypes (issue #54).
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

interface PrototypeSwitcherProps {
  variants: { key: string; name: string }[]
}

// eslint-disable-next-line react-refresh/only-export-components
export function useVariant(variants: { key: string }[]) {
  const [params] = useSearchParams()
  return params.get('variant') ?? variants[0].key
}

export function PrototypeSwitcher({ variants }: PrototypeSwitcherProps) {
  const [params, setParams] = useSearchParams()
  const current = params.get('variant') ?? variants[0].key
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === current),
  )

  function go(delta: number) {
    const next = variants[(index + delta + variants.length) % variants.length]
    setParams({ variant: next.key }, { replace: true })
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, [contenteditable]')) return
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (import.meta.env.PROD) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-full bg-white text-black px-3 py-1.5 shadow-2xl text-sm font-medium">
      <button className="px-2 cursor-pointer" onClick={() => go(-1)} aria-label="Previous variant">
        ←
      </button>
      <span>
        {variants[index].key} — {variants[index].name}
      </span>
      <button className="px-2 cursor-pointer" onClick={() => go(1)} aria-label="Next variant">
        →
      </button>
    </div>
  )
}
