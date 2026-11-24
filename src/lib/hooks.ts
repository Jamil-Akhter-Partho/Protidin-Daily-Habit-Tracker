import { useEffect, useRef, useState } from 'react'
import { todayParts, type Today } from './date'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Today's date, refreshed when the tab regains focus or midnight passes. */
export function useToday(): Today {
  const [today, setToday] = useState(todayParts)
  useEffect(() => {
    const tick = () =>
      setToday((prev) => {
        const next = todayParts()
        return next.key === prev.key ? prev : next
      })
    const id = window.setInterval(tick, 60_000)
    document.addEventListener('visibilitychange', tick)
    window.addEventListener('focus', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
      window.removeEventListener('focus', tick)
    }
  }, [])
  return today
}

/** Animates a number towards `value`. */
export function useCountUp(value: number, ms = 700): number {
  const [shown, setShown] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    if (prefersReducedMotion()) {
      from.current = value
      setShown(value)
      return
    }
    const start = performance.now()
    const a = from.current
    let raf = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      const eased = 1 - Math.pow(1 - t, 3)
      const cur = a + (value - a) * eased
      from.current = cur
      setShown(cur)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])
  return Math.round(shown)
}

/** Returns true if viewport is >= 1024px (desktop layout breakpoint). */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(min-width: 1024px)')
    const update = (e: MediaQueryListEvent | MediaQueryList) => setIsDesktop(e.matches)
    update(media)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return isDesktop
}

