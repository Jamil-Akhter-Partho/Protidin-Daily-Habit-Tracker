import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { prefersReducedMotion } from './hooks'

export type ThemeChoice = 'system' | 'light' | 'dark' | 'night'
export type StyleChoice = 'classic' | 'garden'
export type BloomChoice = 'pink' | 'lavender' | 'peach' | 'mint' | 'sky'

export const THEMES: ThemeChoice[] = ['system', 'light', 'dark', 'night']
export const STYLES: StyleChoice[] = ['classic', 'garden']
/** Bloom colours and their hue angle (also set in garden.css). */
export const BLOOMS: { value: BloomChoice; label: string; hue: number }[] = [
  { value: 'pink', label: 'Pink', hue: 352 },
  { value: 'lavender', label: 'Lavender', hue: 300 },
  { value: 'peach', label: 'Peach', hue: 48 },
  { value: 'mint', label: 'Mint', hue: 165 },
  { value: 'sky', label: 'Sky', hue: 240 },
]

const KEYS = { theme: 'protidin:theme', style: 'protidin:style', bloom: 'protidin:bloom' }

interface Look {
  choice: ThemeChoice
  style: StyleChoice
  bloom: BloomChoice
}

/**
 * How a change of look is animated (see the view-transition rules in index.css):
 * theme = circle growing from the clicked control, style = left-to-right curtain,
 * bloom = quick circle from the swatch, fade = plain cross-fade.
 */
type Transition = 'theme' | 'style' | 'bloom' | 'fade'

function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const saved = localStorage.getItem(key) as T | null
    if (saved && allowed.includes(saved)) return saved
  } catch {
    // storage blocked: use the default
  }
  return fallback
}

function save(look: Look) {
  try {
    localStorage.setItem(KEYS.theme, look.choice)
    localStorage.setItem(KEYS.style, look.style)
    localStorage.setItem(KEYS.bloom, look.bloom)
  } catch {
    // storage blocked: the choice lasts for this visit only
  }
}

const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

/** Writes the look onto <html>, where the stylesheets read it. */
function applyLook(look: Look) {
  const d = document.documentElement.dataset
  d.theme = look.choice === 'system' ? (systemDark() ? 'dark' : 'light') : look.choice
  d.style = look.style
  d.bloom = look.bloom
  const bg = getComputedStyle(document.body).backgroundColor
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg)
}

/** The Garden fonts load on first use; fetching them early stops text jumping mid-transition. */
function gardenFonts(): Promise<unknown> {
  if (!document.fonts) return Promise.resolve()
  return Promise.all([
    document.fonts.load('700 16px "Fredoka Variable"'),
    document.fonts.load('600 16px "Nunito Variable"'),
  ]).catch(() => undefined)
}

type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => { finished: Promise<void> }
}

let transitionRun = 0

/**
 * Runs `update` inside a view transition: the browser animates between a snapshot of the
 * old page and the new one, so the cost does not grow with the number of elements.
 * Falls back to an instant change where unsupported or when reduced motion is requested.
 */
function withTransition(kind: Transition, origin: Element | null, wait: Promise<unknown> | null, update: () => void) {
  const doc = document as ViewTransitionDoc
  if (!doc.startViewTransition || prefersReducedMotion()) {
    update()
    return
  }
  const root = document.documentElement
  const rect = origin?.getBoundingClientRect()
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
  const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
  root.style.setProperty('--vt-x', `${x}px`)
  root.style.setProperty('--vt-y', `${y}px`)
  root.style.setProperty('--vt-r', `${Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))}px`)
  root.dataset.vt = kind
  const run = ++transitionRun

  const transition = doc.startViewTransition(async () => {
    // hold the old snapshot briefly if fonts are still on their way, but never for long
    if (wait) await Promise.race([wait, new Promise((r) => setTimeout(r, 400))])
    update()
  })
  transition.finished.finally(() => {
    // a newer transition may already be running; only the latest one cleans up
    if (run === transitionRun) delete root.dataset.vt
  })
}

/**
 * Look preferences, saved per device and applied as attributes on <html>:
 * data-theme (light | dark | night), data-style (classic | garden), data-bloom.
 * Each setter takes the clicked element so the transition can start from it.
 */
export function useTheme() {
  const [look, setLook] = useState<Look>(() => ({
    choice: read(KEYS.theme, THEMES, 'system'),
    style: read(KEYS.style, STYLES, 'classic'),
    bloom: read(KEYS.bloom, BLOOMS.map((b) => b.value), 'pink'),
  }))
  const current = useRef(look)
  current.current = look

  const change = useCallback((kind: Transition, patch: Partial<Look>, origin?: Element | null) => {
    const next = { ...current.current, ...patch }
    if (next.choice === current.current.choice && next.style === current.current.style && next.bloom === current.current.bloom) return
    save(next)
    const fonts = next.style === 'garden' && current.current.style !== 'garden' ? gardenFonts() : null
    withTransition(kind, origin ?? null, fonts, () => {
      applyLook(next)
      // flushSync: the new page must be fully rendered before the browser takes its snapshot
      flushSync(() => setLook(next))
    })
  }, [])

  // first paint, and following the device when the choice is "system"
  useEffect(() => {
    applyLook(current.current)
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (current.current.choice === 'system') withTransition('fade', null, null, () => applyLook(current.current))
    }
    media.addEventListener('change', onChange)
    // warm the Garden fonts while idle so the first switch is instant
    const idle = window.setTimeout(gardenFonts, 1500)
    return () => {
      media.removeEventListener('change', onChange)
      window.clearTimeout(idle)
    }
  }, [])

  return {
    ...look,
    setChoice: (choice: ThemeChoice, origin?: Element | null) => change('theme', { choice }, origin),
    setStyle: (style: StyleChoice, origin?: Element | null) => change('style', { style }, origin),
    setBloom: (bloom: BloomChoice, origin?: Element | null) => change('bloom', { bloom }, origin),
  }
}

export type ThemeState = ReturnType<typeof useTheme>
