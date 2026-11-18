import { useState, type CSSProperties } from 'react'
import { dateKey, MONTHS, type Today } from '../lib/date'
import type { MonthStats } from '../lib/stats'
import { ck, type State } from '../lib/store'
import { DayTip, useDayFocus } from './DayFocus'

const pctText = (v: number) => `${Math.round(v * 100)}%`

/**
 * Classic style's daily chart: one capsule per day in its week colour, filled to that day's
 * completion. Filter to a single habit to see just its days.
 */
export function RhythmChart({
  stats,
  state,
  year,
  month,
  today,
}: {
  stats: MonthStats
  state: State
  year: number
  month: number
  today: Today
}) {
  const [filter, setFilter] = useState<string | null>(null)
  const focus = useDayFocus(stats.elapsed)
  const { habits, checks } = state
  const habit = habits.find((h) => h.id === filter) ?? null
  const habitCount = habits.length

  const W = 760
  const H = 300
  const L = 46
  const R = 20
  const T = 32
  const ground = H - 42
  const { dim, elapsed, perDay } = stats
  const step = (W - L - R) / (dim - 1)
  const colW = Math.min(16, step - 7)
  const x = (d: number) => L + (d - 1) * step
  const y = (p: number) => ground - p * (ground - T)
  const mon = MONTHS[month].slice(0, 3)
  const isToday = (d: number) => year === today.y && month === today.m && d === today.d
  const doneOn = (id: string, d: number) => !!checks[ck(id, dateKey(year, month, d))]

  const pts = habitCount
    ? Array.from({ length: elapsed }, (_, i) => {
        const d = i + 1
        if (habit) {
          const n = doneOn(habit.id, d) ? 1 : 0
          return { d, p: n, n }
        }
        return { d, p: perDay[i] / habitCount, n: perDay[i] }
      })
    : []
  const byDay = new Map(pts.map((p) => [p.d, p]))
  const avg = pts.length ? pts.reduce((s, p) => s + p.p, 0) / pts.length : 0
  const best = pts.reduce<(typeof pts)[number] | null>((b, p) => (p.n > 0 && p.p > (b?.p ?? 0) ? p : b), null)
  const own = habit ? stats.perHabit.find((h) => h.habit.id === habit.id) : null

  const chips = own
    ? [
        { label: 'Days done', value: String(own.done) },
        { label: 'Streak', value: `${own.streak}d` },
        { label: 'Monthly goal', value: `${own.done}/${own.goal}` },
      ]
    : [
        { label: 'Daily average', value: pts.length ? pctText(avg) : '–' },
        { label: 'Best day', value: best ? `${mon} ${best.d}` : '–' },
        { label: 'Perfect days', value: String(stats.perfectDays) },
      ]

  const tip = focus.active != null ? (byDay.get(focus.active) ?? null) : null
  const chip = (on: boolean) =>
    `grid h-8 place-items-center rounded-full border text-[12.5px] font-semibold transition ${
      on ? 'border-accent bg-accent text-on-accent' : 'border-line hover:bg-surface-2'
    }`

  return (
    <section className="gazette-card rise flex flex-col p-5 xl:col-span-2" style={{ ['--i' as string]: 6 }}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[17px] font-bold text-ink">Daily rhythm</h2>
            <span className="rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-ink-3">
              Folio 30D
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-ink-3">
            {habit ? `Recorded audit for “${habit.name}”` : 'Daily completion audit & temporal velocity'}
          </p>
        </div>
        <div className="flex gap-2">
          {chips.map((c) => (
            <div key={c.label} className="gazette-stamp text-center">
              <div className="num font-display text-[15px] font-bold leading-tight text-ink">{c.value}</div>
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-ink-3">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {habitCount > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Show">
          <button role="radio" aria-checked={!habit} className={`${chip(!habit)} px-3`} onClick={() => setFilter(null)}>
            All habits
          </button>
          {habits.map((h) => (
            <button
              key={h.id}
              role="radio"
              aria-checked={habit?.id === h.id}
              aria-label={h.name}
              title={h.name}
              className={`${chip(habit?.id === h.id)} w-8 text-[15px]`}
              onClick={() => setFilter(habit?.id === h.id ? null : h.id)}
            >
              {h.emoji}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 flex-col justify-center">
        <div
          className="daychart gazette-inner relative w-full p-3.5"
          tabIndex={pts.length ? 0 : -1}
          role="group"
          aria-label={`Daily rhythm for ${MONTHS[month]} ${year}. Use the left and right arrow keys to move between days.`}
          {...focus.wrapProps}
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" aria-hidden="true">
            {[0, 0.5, 1].map((p) => (
              <g key={p}>
                <line x1={L - step / 2} x2={W - R + step / 2} y1={y(p)} y2={y(p)} stroke="var(--ink-3)" strokeOpacity="0.22" strokeDasharray={p === 0 ? undefined : '2 5'} />
                <text x={L - step / 2 - 6} y={y(p) + 3.5} textAnchor="end" fontSize="10" fill="var(--ink-3)" className="num">
                  {p * 100}%
                </text>
              </g>
            ))}

            {Array.from({ length: dim }, (_, i) => i + 1).map((d) => {
              const pt = byDay.get(d)
              const on = tip?.d === d
              const h = pt && pt.p > 0 ? Math.max(colW, pt.p * (ground - T)) : 0
              return (
                <g key={d} className={`wk-${Math.floor((d - 1) / 7) + 1}`}>
                  <rect x={x(d) - colW / 2} y={T} width={colW} height={ground - T} rx={colW / 2} fill="var(--wk-soft)" opacity={pt ? 1 : 0.5} />
                  {h > 0 && (
                    <rect
                      className="col-fill"
                      style={{ ['--i' as string]: d } as CSSProperties}
                      x={x(d) - colW / 2}
                      y={ground - h}
                      width={colW}
                      height={h}
                      rx={colW / 2}
                      fill="var(--wk)"
                    />
                  )}
                  {on && (
                    <rect x={x(d) - colW / 2 - 3} y={T - 3} width={colW + 6} height={ground - T + 6} rx={colW / 2 + 3} fill="none" stroke="var(--wk)" strokeWidth="1.6" />
                  )}
                  {pt && (on || isToday(d)) && (
                    <text x={x(d)} y={T - 9} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="var(--ink)" className="num">
                      {habit ? (pt.n ? 'Done' : 'Missed') : pctText(pt.p)}
                    </text>
                  )}
                </g>
              )
            })}

            {/* average line (all habits only) with vintage crimson rule */}
            {!habit && pts.length > 1 && (
              <g>
                <line x1={L - step / 2} x2={W - R + step / 2} y1={y(avg)} y2={y(avg)} stroke="var(--danger)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.9" />
                <rect x={W - R + step / 2 - 54} y={y(avg) - 9} width="54" height="18" rx="4" fill="var(--danger)" />
                <text x={W - R + step / 2 - 27} y={y(avg) + 3.6} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#ffffff" className="num">
                  avg {pctText(avg)}
                </text>
              </g>
            )}

            {/* day axis */}
            {Array.from({ length: dim }, (_, i) => i + 1).map((d) => {
              const on = tip?.d === d
              const now = isToday(d)
              return (
                <g key={d}>
                  {(now || on) && <rect x={x(d) - 10} y={H - 29} width="20" height="18" rx="5" fill={now ? 'var(--accent)' : 'var(--surface-2)'} />}
                  <text
                    x={x(d)}
                    y={H - 16}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight={now || on ? 800 : 500}
                    fill={now ? 'var(--on-accent)' : on ? 'var(--ink)' : 'var(--ink-3)'}
                    className="num"
                  >
                    {d}
                  </text>
                </g>
              )
            })}

            {pts.map((pt) => (
              <rect key={pt.d} x={x(pt.d) - step / 2} y={0} width={step} height={H} fill="transparent" {...focus.hitProps(pt.d)} />
            ))}

            {!pts.length && (
              <text x={W / 2} y={(T + ground) / 2} textAnchor="middle" fontSize="13" fill="var(--ink-3)">
                {habitCount ? 'This month has not started yet' : 'Add a habit to see your rhythm'}
              </text>
            )}
          </svg>

          {tip && (
            <DayTip
              year={year}
              month={month}
              day={tip.d}
              isToday={isToday(tip.d)}
              leftPct={(x(tip.d) / W) * 100}
              value={habit ? (tip.n ? 'Done' : 'Missed') : pctText(tip.p)}
              sub={habit ? habit.name : `${tip.n} of ${habitCount} habits`}
              items={(habit ? [habit] : habits).map((h) => ({ id: h.id, emoji: h.emoji, name: h.name, done: doneOn(h.id, tip.d) }))}
              pinned={focus.pinned === tip.d}
            />
          )}
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium text-ink-3">
          <span>* Recorded in chronological order (Days 1–{dim})</span>
          <span className="num font-bold">Folio {year}-{String(month + 1).padStart(2, '0')}</span>
        </div>
      </div>
    </section>
  )
}
