import { useState, type KeyboardEvent } from 'react'
import { MONTHS, WEEKDAY_SHORT } from '../lib/date'

/**
 * Shared interaction for the per-day charts: hover a day to inspect it, click to pin it,
 * arrow keys to move between days, Escape to clear.
 */
export function useDayFocus(elapsed: number) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [pinned, setPinned] = useState<number | null>(null)
  const raw = hovered ?? pinned
  const active = raw != null && raw >= 1 && raw <= elapsed ? raw : null

  const onKeyDown = (e: KeyboardEvent) => {
    if (!elapsed) return
    if (e.key === 'Escape') {
      setPinned(null)
      setHovered(null)
      return
    }
    const delta = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0
    if (!delta) return
    e.preventDefault()
    setHovered(null)
    setPinned((cur) => Math.max(1, Math.min(elapsed, (cur ?? active ?? elapsed + (delta < 0 ? 1 : 0)) + delta)))
  }

  return {
    active,
    pinned,
    /** Spread on the focusable chart wrapper. */
    wrapProps: { onKeyDown, onPointerLeave: () => setHovered(null) },
    /** Spread on the invisible hit area of one day. */
    hitProps: (d: number) => ({
      style: { cursor: 'pointer' },
      onPointerEnter: () => setHovered(d),
      onPointerDown: () => setHovered(d),
      onClick: () => setPinned((cur) => (cur === d ? null : d)),
    }),
  }
}

/** Floating card describing one day. Sits beside the day's column, on whichever side has room. */
export function DayTip({
  year,
  month,
  day,
  isToday,
  leftPct,
  value,
  sub,
  items,
  pinned,
}: {
  year: number
  month: number
  day: number
  isToday: boolean
  /** Horizontal position of the day inside the chart, 0–100. */
  leftPct: number
  value: string
  sub: string
  items: { id: string; emoji: string; name: string; done: boolean }[]
  pinned: boolean
}) {
  const right = leftPct < 56
  return (
    <div
      className="day-tip"
      role="status"
      style={{ left: `${leftPct}%`, transform: right ? 'translateX(18px)' : 'translateX(calc(-100% - 18px))' }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-bold text-ink-2">
          {WEEKDAY_SHORT[new Date(year, month, day).getDay()]}, {MONTHS[month].slice(0, 3)} {day}
        </span>
        {isToday && <span className="rounded-full bg-(--tip) px-2 py-0.5 text-[10px] font-extrabold text-(--tip-on)">Today</span>}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="num font-display text-[28px] font-bold leading-none">{value}</span>
        <span className="num text-[12px] text-ink-3">{sub}</span>
      </div>
      <ul className="mt-2.5 space-y-1">
        {items.map((h) => (
          <li key={h.id} className={`flex items-center gap-2 text-[12px] ${h.done ? 'font-semibold' : 'text-ink-3'}`}>
            <span
              className={`grid size-4 shrink-0 place-items-center rounded-full text-[9px] font-black ${
                h.done ? 'bg-(--tip) text-(--tip-on)' : 'border border-line'
              }`}
            >
              {h.done ? '✓' : ''}
            </span>
            <span className={h.done ? '' : 'opacity-60 grayscale'}>{h.emoji}</span>
            <span className="max-w-[150px] truncate">{h.name}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2.5 border-t border-line pt-1.5 text-[10.5px] text-ink-3">
        {pinned ? 'Pinned · click again to release' : 'Click to pin · arrow keys to move'}
      </div>
    </div>
  )
}
