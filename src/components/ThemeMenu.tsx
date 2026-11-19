import { useEffect, useRef, useState } from 'react'
import { Check, Flower2, LayoutGrid, Monitor, Moon, MoonStar, Palette, Sparkles, Sun, type LucideIcon } from 'lucide-react'
import { BLOOMS, type StyleChoice, type ThemeChoice, type ThemeState } from '../lib/theme'

const STYLE_OPTIONS: { value: StyleChoice; label: string; hint: string; Icon: LucideIcon }[] = [
  { value: 'classic', label: 'Classic', hint: 'Colourful weeks', Icon: LayoutGrid },
  { value: 'garden', label: 'Garden', hint: 'Grow a tree a day', Icon: Flower2 },
  { value: 'noor', label: 'Noor', hint: 'Illuminate days', Icon: Sparkles },
]

const THEME_OPTIONS: { value: ThemeChoice; label: string; Icon: LucideIcon }[] = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'night', label: 'Night', Icon: MoonStar },
]

const Label = ({ children }: { children: string }) => (
  <div className="px-1 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-wider text-ink-3">{children}</div>
)

export function ThemeMenu({ theme }: { theme: ThemeState }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      // While a look transition plays, every click lands on the page snapshot, not on
      // the real elements. Those must not count as a click outside the menu.
      if (document.documentElement.dataset.vt) return
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrap} className="relative">
      <button
        className="btn !w-[38px] justify-center !px-0"
        onClick={() => setOpen((o) => !o)}
        aria-label="Appearance"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Appearance"
      >
        <Palette size={17} />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Appearance"
          className="menu-pop absolute right-0 top-[46px] z-30 w-[326px] space-y-3 rounded-3xl border border-line bg-surface p-3"
          style={{ boxShadow: 'var(--shadow-pop)' }}
        >
          <div>
            <Label>Style</Label>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Style">
              {STYLE_OPTIONS.map(({ value, label, hint, Icon }) => {
                const on = theme.style === value
                return (
                  <button
                    key={value}
                    role="radio"
                    aria-checked={on}
                    onClick={(e) => theme.setStyle(value, e.currentTarget)}
                    className={`relative rounded-2xl border p-2.5 text-left transition ${
                      on ? 'border-accent bg-surface-2' : 'border-line hover:bg-surface-2'
                    }`}
                  >
                    <Icon size={18} className={on ? 'text-accent' : 'text-ink-2'} />
                    <span className="mt-1.5 block text-[12.5px] font-bold leading-tight">{label}</span>
                    <span className="mt-0.5 block text-[10.5px] leading-tight text-ink-3">{hint}</span>
                    {on && <Check size={13} className="absolute right-2 top-2 text-good" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <Label>Theme</Label>
            <div className="grid grid-cols-4 gap-1 rounded-2xl bg-surface-2 p-1" role="radiogroup" aria-label="Theme">
              {THEME_OPTIONS.map(({ value, label, Icon }) => {
                const on = theme.choice === value
                return (
                  <button
                    key={value}
                    role="radio"
                    aria-checked={on}
                    onClick={(e) => theme.setChoice(value, e.currentTarget)}
                    className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11.5px] font-semibold transition ${
                      on ? 'bg-surface shadow-sm' : 'text-ink-2 hover:text-ink'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {theme.style === 'garden' && (
            <div>
              <Label>Bloom colour</Label>
              <div className="flex justify-between px-1" role="radiogroup" aria-label="Bloom colour">
                {BLOOMS.map(({ value, label, hue }) => {
                  const on = theme.bloom === value
                  return (
                    <button
                      key={value}
                      role="radio"
                      aria-checked={on}
                      aria-label={label}
                      title={label}
                      onClick={(e) => theme.setBloom(value, e.currentTarget)}
                      className="grid size-10 place-items-center rounded-full transition hover:scale-110"
                      style={{
                        background: `oklch(0.74 0.15 ${hue})`,
                        boxShadow: on ? `0 0 0 3px var(--surface), 0 0 0 5px oklch(0.6 0.17 ${hue})` : undefined,
                      }}
                    >
                      {on && <Check size={17} color="#fff" strokeWidth={3} />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
