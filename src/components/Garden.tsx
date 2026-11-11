import { useState, type CSSProperties, type ReactNode } from 'react'
import { dateKey, MONTHS, WEEKDAY_SHORT, type Today } from '../lib/date'
import { useCountUp } from '../lib/hooks'
import type { MonthStats } from '../lib/stats'
import { ck, type State } from '../lib/store'
import { DayTip, useDayFocus } from './DayFocus'
import { Plant, plantStage } from './Plant'

const pctText = (v: number) => `${Math.round(v * 100)}%`
const PETAL_ANGLES = [0, 72, 144, 216, 288].map((a) => ((a - 90) * Math.PI) / 180)

/* ---------- living mini-blooms for the three garden stat cards ---------- */
function TodayBloom({ done, total }: { done: number; total: number }) {
  const ratio = total ? done / total : 0
  const openPetals = ratio <= 0 ? 0 : Math.max(1, Math.round(ratio * 5))
  const full = total > 0 && done >= total

  return (
    <svg width="34" height="34" viewBox="0 0 36 36" aria-hidden="true">
      <g className="bloom-sway" style={{ transformOrigin: '18px 33px' }}>
        <path d="M18 33 Q17.5 25 18 19" stroke="var(--leaf-2)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M18 29 C12 29 10 25 12 22 C15 22 18 25 18 29 Z" fill="var(--leaf)" />
        {openPetals === 0 ? (
          <>
            <path d="M18 26 C24 26 26 22 24 19 C21 19 18 22 18 26 Z" fill="var(--leaf)" />
            <path d="M18 20 C13 18 13 10 18 7 C23 10 23 18 18 20 Z" fill="var(--petal-2)" />
            <path d="M18 19 C15.5 17 15.5 11.5 18 9 C20.5 11.5 20.5 17 18 19 Z" fill="var(--petal-1)" />
          </>
        ) : (
          <>
            {PETAL_ANGLES.map((a, i) => {
              const active = i < openPetals
              return (
                <circle
                  key={i}
                  cx={18 + Math.cos(a) * 6.4}
                  cy={16 + Math.sin(a) * 6.4}
                  r={active ? 5.2 : 3.4}
                  fill={active ? (full ? 'var(--petal-3)' : 'var(--petal-2)') : 'var(--petal-1)'}
                  opacity={active ? 1 : 0.35}
                  style={{ transition: 'r 0.35s ease, opacity 0.3s ease, fill 0.3s ease' }}
                />
              )
            })}
            <circle cx="18" cy="16" r="4" fill={full ? 'var(--gold)' : 'var(--petal-hi)'} />
            {full && <path className="twinkle" d="M30 5 l1 2.4 2.4 1 -2.4 1 -1 2.4 -1 -2.4 -2.4 -1 2.4 -1 Z" fill="var(--gold)" />}
          </>
        )}
      </g>
    </svg>
  )
}

function GoalBloom({ pct }: { pct: number }) {
  const bright = pct >= 0.5
  const full = pct >= 1
  return (
    <svg width="34" height="34" viewBox="0 0 36 36" aria-hidden="true">
      <g className="bloom-sway-alt" style={{ transformOrigin: '18px 33px' }}>
        <path d="M18 33 V21" stroke="var(--leaf-2)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <g className="bloom-breathe" style={{ transformOrigin: '18px 17px' }}>
          {[0, 72, 144, 216, 288].map((a, i) => (
            <ellipse
              key={a}
              cx="18"
              cy="10.2"
              rx="4.2"
              ry="6.8"
              fill={full ? 'var(--petal-3)' : i % 2 === 0 ? 'var(--petal-2)' : 'var(--petal-1)'}
              opacity={pct <= 0 ? 0.65 : bright ? 0.98 : 0.85}
              transform={`rotate(${a} 18 17)`}
            />
          ))}
          <circle cx="18" cy="17" r="3.6" fill={bright ? 'var(--gold)' : 'var(--petal-3)'} />
          <circle cx="18" cy="17" r="1.6" fill="var(--petal-hi)" />
        </g>
        {full && <path className="twinkle" d="M29.5 6 l0.9 2.1 2.1 0.9 -2.1 0.9 -0.9 2.1 -0.9 -2.1 -2.1 -0.9 2.1 -0.9 Z" fill="var(--gold)" />}
      </g>
    </svg>
  )
}

function StreakBloom({ streak }: { streak: number }) {
  const active = streak > 0
  return (
    <svg width="34" height="34" viewBox="0 0 36 36" aria-hidden="true">
      <path d="M18 33 V21" stroke="var(--leaf-2)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <g className={active ? 'bloom-spin' : 'bloom-breathe'} style={{ transformOrigin: '18px 17px' }}>
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={i}
            cx="18"
            cy="9.5"
            rx="2.7"
            ry="5.5"
            fill={active ? (i % 2 ? 'var(--petal-3)' : 'var(--petal-2)') : 'var(--petal-1)'}
            opacity={active ? 0.95 : 0.55}
            transform={`rotate(${i * 45} 18 17)`}
          />
        ))}
      </g>
      <circle cx="18" cy="17" r="4.2" fill={active ? 'var(--gold)' : 'var(--petal-2)'} />
      {active && <path className="twinkle" d="M6 7 l0.9 2.1 2.1 0.9 -2.1 0.9 -0.9 2.1 -0.9 -2.1 -2.1 -0.9 2.1 -0.9 Z" fill="var(--gold)" />}
    </svg>
  )
}

function AvgBloom({ pct }: { pct: number }) {
  const bright = pct >= 0.5
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden="true">
      <g className="bloom-sway" style={{ transformOrigin: '14px 25px' }}>
        <path d="M14 25 V14" stroke="var(--leaf-2)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M14 22 C9 22 8 18 10 16 C12 16 14 19 14 22 Z" fill="var(--leaf)" />
        {pct <= 0 ? (
          <path d="M14 15 C10 13 10 7 14 5 C18 7 18 13 14 15 Z" fill="var(--petal-2)" />
        ) : (
          <>
            {PETAL_ANGLES.map((a, i) => (
              <circle
                key={i}
                cx={14 + Math.cos(a) * 4.4}
                cy={11.8 + Math.sin(a) * 4.4}
                r={3}
                fill={bright ? 'var(--petal-3)' : 'var(--petal-2)'}
              />
            ))}
            <circle cx="14" cy="11.8" r="2.6" fill={bright ? 'var(--gold)' : 'var(--petal-hi)'} />
          </>
        )}
      </g>
    </svg>
  )
}

function BestDayBloom({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden="true">
      <g className="bloom-breathe" style={{ transformOrigin: '14px 14px' }}>
        {PETAL_ANGLES.map((a, i) => (
          <circle
            key={i}
            cx={14 + Math.cos(a) * 5.4}
            cy={14 + Math.sin(a) * 5.4}
            r={3.5}
            fill={active ? (i % 2 ? 'var(--petal-2)' : 'var(--petal-3)') : i % 2 ? 'var(--petal-1)' : 'var(--petal-2)'}
            opacity={active ? 1 : 0.7}
          />
        ))}
        <circle cx="14" cy="14" r="3.3" fill={active ? 'var(--gold)' : 'var(--petal-3)'} />
      </g>
    </svg>
  )
}

function FullBloomsBadge({ count }: { count: number }) {
  const active = count > 0
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden="true">
      <g className={active ? 'bloom-spin' : 'bloom-breathe'} style={{ transformOrigin: '14px 14px' }}>
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse
            key={i}
            cx="14"
            cy="7"
            rx="2.3"
            ry="4.5"
            fill={active ? (i % 2 ? 'var(--petal-3)' : 'var(--petal-2)') : 'var(--petal-1)'}
            opacity={active ? 0.95 : 0.65}
            transform={`rotate(${i * 60} 14 14)`}
          />
        ))}
      </g>
      <circle cx="14" cy="14" r="3.4" fill={active ? 'var(--gold)' : 'var(--petal-2)'} />
      {active && <path className="twinkle" d="M23 4 l0.8 1.8 1.8 0.8 -1.8 0.8 -0.8 1.8 -0.8 -1.8 -1.8 -0.8 1.8 -0.8 Z" fill="var(--gold)" />}
    </svg>
  )
}

/* ---------- "You planted N trees" card ---------- */
function GardenCard({
  stats,
  todayDone,
  habitCount,
  isCurrentMonth,
}: {
  stats: MonthStats
  todayDone: number
  habitCount: number
  isCurrentMonth: boolean
}) {
  const trees = useCountUp(stats.perfectDays)
  // The big tree is today's tree; for other months it shows the month as a whole.
  const stage = isCurrentMonth ? plantStage(todayDone, habitCount) : plantStage(stats.monthDone, stats.monthGoal)
  const left = habitCount - todayDone
  const top = stats.perHabit.reduce((best, h) => Math.max(best, h.streak), 0)

  const caption = !habitCount
    ? 'Add a habit to plant your first seed'
    : !isCurrentMonth
      ? `This month reached ${pctText(stats.monthPct)} of its goals`
      : stage === 0
        ? 'Tick a habit to plant today’s seed'
        : stage === 5
          ? 'Today’s tree is in full bloom!'
          : `Today’s tree is growing · ${left} to go`

  const pills: { label: string; value: string; bloom: ReactNode }[] = [
    { label: 'Today', value: `${todayDone}/${habitCount}`, bloom: <TodayBloom done={todayDone} total={habitCount} /> },
    { label: 'Monthly goals', value: pctText(stats.monthPct), bloom: <GoalBloom pct={stats.monthPct} /> },
    { label: 'Best streak', value: `${top}d`, bloom: <StreakBloom streak={top} /> },
  ]

  return (
    <section className="card rise flex flex-col overflow-hidden" style={{ ['--i' as string]: 1 }} aria-label="Your garden">
      <div className="garden-banner px-5 py-4 text-center">
        <div className="text-[13px] font-bold opacity-90">You planted</div>
        <div className="font-display text-[30px] font-bold leading-tight">
          <span className="num">{trees}</span> {stats.perfectDays === 1 ? 'tree' : 'trees'} this month
        </div>
      </div>

      <div className="garden-scene relative flex flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {Array.from({ length: stage === 5 ? 9 : 4 }, (_, i) => (
            <span
              key={i}
              className={`petal-fall ${stage === 5 ? '' : 'is-subtle'}`}
              style={{ ['--i' as string]: i, left: `${10 + ((i * 39) % 80)}%` } as CSSProperties}
            />
          ))}
        </div>

        <div className="relative flex min-h-[208px] flex-1 items-end justify-center">
          {/* Full-width hill horizon matching the meadow section seamlessly below */}
          <svg
            viewBox="0 0 380 86"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 -bottom-px h-[86px] w-full"
            aria-hidden="true"
          >
            <path d="M-10 30 Q95 8 195 26 T390 24 L390 86 L-10 86 Z" fill="var(--hill)" opacity="0.45" />
            <path d="M-10 44 Q190 6 390 44 L390 86 L-10 86 Z" fill="var(--hill)" />
          </svg>

          {/* Non-distorting swaying wildflowers flanking the soil patch */}
          <svg
            viewBox="0 0 380 86"
            preserveAspectRatio="xMidYMax meet"
            className="pointer-events-none absolute bottom-0 left-1/2 h-[86px] w-full max-w-[440px] -translate-x-1/2"
            aria-hidden="true"
          >
            <g className="bloom-sway" style={{ transformOrigin: '40px 64px' }}>
              <path d="M40 64 Q38 52 41 44" stroke="var(--leaf-2)" strokeWidth="2" fill="none" strokeLinecap="round" />
              <circle cx="41" cy="40" r="3" fill="var(--petal-2)" />
              <circle cx="37" cy="43" r="2.6" fill="var(--petal-1)" />
              <circle cx="45" cy="43" r="2.6" fill="var(--petal-1)" />
              <circle cx="41" cy="43" r="2" fill="var(--gold)" />
            </g>
            <g className="bloom-sway-alt" style={{ transformOrigin: '84px 54px' }}>
              <path d="M84 54 Q86 45 83 39" stroke="var(--leaf-2)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M83 40 C80 37 80 32 83 30 C86 32 86 37 83 40 Z" fill="var(--petal-3)" />
            </g>
            <g className="bloom-sway-alt" style={{ transformOrigin: '296px 54px' }}>
              <path d="M296 54 Q294 44 297 38" stroke="var(--leaf-2)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <circle cx="297" cy="35" r="2.6" fill="var(--petal-1)" />
              <circle cx="293.5" cy="38" r="2.3" fill="var(--petal-2)" />
              <circle cx="300.5" cy="38" r="2.3" fill="var(--petal-2)" />
              <circle cx="297" cy="37.5" r="1.8" fill="var(--petal-hi)" />
            </g>
            <g className="bloom-sway" style={{ transformOrigin: '340px 64px' }}>
              <path d="M340 64 Q343 51 339 42" stroke="var(--leaf-2)" strokeWidth="2" fill="none" strokeLinecap="round" />
              <circle cx="339" cy="38" r="3.2" fill="var(--petal-3)" />
              <circle cx="335" cy="41" r="2.6" fill="var(--petal-2)" />
              <circle cx="343" cy="41" r="2.6" fill="var(--petal-2)" />
              <circle cx="339" cy="41" r="2.1" fill="var(--gold)" />
            </g>
            <g opacity="0.72" className="bloom-sway-alt" style={{ transformOrigin: '18px 80px' }}>
              <path d="M18 80 Q15 70 18 63 M18 80 Q22 72 24 66" stroke="var(--leaf-2)" strokeWidth="1.7" fill="none" strokeLinecap="round" />
              <circle cx="18" cy="62" r="2.3" fill="var(--petal-2)" />
            </g>
            <g opacity="0.72" className="bloom-sway" style={{ transformOrigin: '362px 80px' }}>
              <path d="M362 80 Q359 71 356 65 M362 80 Q365 70 363 62" stroke="var(--leaf-2)" strokeWidth="1.7" fill="none" strokeLinecap="round" />
              <circle cx="363" cy="61" r="2.3" fill="var(--petal-1)" />
            </g>
          </svg>

          <div className="relative z-10 pb-2">
            <Plant stage={stage} size={160} sway soil />
          </div>
        </div>

        <div className="garden-meadow relative z-10 pb-4 pt-1">
          <p className="px-5 text-center text-[13.5px] font-semibold text-ink-2">{caption}</p>

          <div className="grid grid-cols-3 gap-2.5 px-4 pt-3">
            {pills.map((p) => (
              <div key={p.label} className="garden-pill flex flex-col items-center rounded-2xl px-2 py-2.5 text-center">
                <div className="bloom-flower mb-1">{p.bloom}</div>
                <div className="num font-display text-[20px] font-bold leading-none">{p.value}</div>
                <div className="mt-1 text-[11.5px] font-medium text-ink-3">{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- flower meadow: one flower per day, height = that day's completion ---------- */

function FlowerHead({ p }: { p: number }) {
  if (p >= 1 || p >= 0.34) {
    const full = p >= 1
    const ring = full ? 5 : 4.1
    const r = full ? 3.9 : 3.2
    return (
      <>
        {PETAL_ANGLES.map((a, i) => (
          <circle key={i} cx={Math.cos(a) * ring} cy={Math.sin(a) * ring} r={r} fill={full ? 'var(--petal-3)' : 'var(--petal-2)'} />
        ))}
        <circle r={full ? 3.1 : 2.5} fill={full ? 'var(--gold)' : 'var(--petal-hi)'} />
      </>
    )
  }
  // a closed bud
  return (
    <>
      <path d="M0 4 C-4 2 -4 -3 0 -6 C4 -3 4 2 0 4 Z" fill="var(--petal-2)" />
      <path d="M0 4 C-3 4 -4.5 2 -4.5 0 C-2 0.5 -0.5 2 0 4 Z M0 4 C3 4 4.5 2 4.5 0 C2 0.5 0.5 2 0 4 Z" fill="var(--leaf-2)" />
    </>
  )
}

function Meadow({
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
  const focus = useDayFocus(stats.elapsed)
  const { active, pinned } = focus

  const W = 760
  const H = 330
  const L = 46
  const R = 22
  const T = 54
  const ground = H - 54
  const { dim, elapsed, perDay, weeks } = stats
  const { habits, checks } = state
  const habitCount = habits.length
  const step = (W - L - R) / (dim - 1)
  const x = (d: number) => L + (d - 1) * step
  const y = (p: number) => T + (1 - p) * (ground - T)
  /** Flower heads never sink into the soil, even at 1%. */
  const headY = (p: number) => Math.min(y(p), ground - 13)
  const mon = MONTHS[month].slice(0, 3)
  const isToday = (d: number) => year === today.y && month === today.m && d === today.d

  const pts = habitCount
    ? Array.from({ length: elapsed }, (_, i) => ({ d: i + 1, p: perDay[i] / habitCount, n: perDay[i] }))
    : []
  const avg = pts.length ? pts.reduce((s, p) => s + p.p, 0) / pts.length : 0
  const best = pts.reduce<(typeof pts)[number] | null>((b, p) => (p.n > 0 && p.p > (b?.p ?? 0) ? p : b), null)
  const blooms = pts.filter((p) => p.p >= 1).length

  // soft hill behind the flowers, for reading the trend at a glance
  let hill = ''
  pts.forEach((pt, i) => {
    if (i === 0) hill = `M${x(pt.d)},${y(pt.p)}`
    else {
      const prev = pts[i - 1]
      const mx = (x(prev.d) + x(pt.d)) / 2
      hill += ` C${mx},${y(prev.p)} ${mx},${y(pt.p)} ${x(pt.d)},${y(pt.p)}`
    }
  })
  if (pts.length > 1) hill += ` L${x(pts[pts.length - 1].d)},${ground} L${x(1)},${ground} Z`

  const tip = active != null && active <= pts.length ? pts[active - 1] : null
  const tipKey = tip ? dateKey(year, month, tip.d) : ''

  const chips: { label: string; value: string; bloom: ReactNode }[] = [
    { label: 'Daily average', value: pts.length ? pctText(avg) : '–', bloom: <AvgBloom pct={pts.length ? avg : 0} /> },
    { label: 'Best day', value: best ? `${mon} ${best.d}` : '–', bloom: <BestDayBloom active={!!best} /> },
    { label: 'Full blooms', value: String(blooms), bloom: <FullBloomsBadge count={blooms} /> },
  ]
  const avgLineY = Math.min(y(avg), ground - 2)
  const avgPillY = Math.min(y(avg), ground - 13)

  return (
    <section className="card rise flex flex-col p-5" style={{ ['--i' as string]: 2 }}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[19px] font-bold">Flower meadow</h2>
          <p className="text-[12.5px] text-ink-3">One flower a day. The more you finish, the taller it grows.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <div key={c.label} className="garden-chip flex items-center gap-2 rounded-2xl px-3 py-1.5">
              <div className="bloom-flower shrink-0">{c.bloom}</div>
              <div className="text-left">
                <div className="num font-display text-[16px] font-bold leading-tight">{c.value}</div>
                <div className="whitespace-nowrap text-[10.5px] text-ink-3">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center">
        <div
          className="daychart relative w-full"
          tabIndex={pts.length ? 0 : -1}
          role="group"
          aria-label={`Flower meadow for ${MONTHS[month]} ${year}. Use the left and right arrow keys to move between days.`}
          {...focus.wrapProps}
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" aria-hidden="true">
            {/* week bands and labels */}
            {weeks.map((w) => (
              <g key={w.index} className={`wk-${w.index + 1}`}>
                <rect
                  x={x(w.start) - step / 2 + 2}
                  y={T - 40}
                  width={(w.end - w.start + 1) * step - 4}
                  height={ground - T + 40}
                  rx="12"
                  fill="var(--wk-soft)"
                  opacity="0.55"
                />
                <text x={(x(w.start) + x(w.end)) / 2} y={T - 27} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="var(--wk-deep)" opacity="0.7">
                  WEEK {w.index + 1}
                </text>
              </g>
            ))}

            {[0.5, 1].map((p) => (
              <g key={p}>
                <line x1={L - step / 2} x2={W - R + step / 2} y1={y(p)} y2={y(p)} stroke="var(--ink-3)" strokeOpacity="0.25" strokeDasharray="2 5" />
                <text x={L - step / 2 - 6} y={y(p) + 3.5} textAnchor="end" fontSize="10" fill="var(--ink-3)" className="num">
                  {p * 100}%
                </text>
              </g>
            ))}

            {hill && <path className="trend-area" d={hill} fill="var(--petal-1)" opacity="0.3" />}

            {/* highlighted column */}
            {tip && (
              <rect x={x(tip.d) - step / 2} y={T - 40} width={step} height={ground - T + 40} rx="10" fill="var(--bloom)" opacity="0.2" />
            )}

            {/* soil */}
            <rect x={L - step / 2} y={ground - 1} width={W - L - R + step} height="9" rx="4.5" fill="var(--hill)" />

            {/* future days: empty plots */}
            {Array.from({ length: dim - pts.length }, (_, i) => pts.length + i + 1).map((d) => (
              <circle key={d} cx={x(d)} cy={ground + 3.5} r="1.6" fill="var(--soil)" opacity="0.55" />
            ))}

            {/* average line (drawn above soil so 0% stays legible) */}
            {pts.length > 1 && (
              <line
                x1={L - step / 2}
                x2={W - R + step / 2}
                y1={avgLineY}
                y2={avgLineY}
                stroke="var(--accent)"
                strokeWidth="1.4"
                strokeDasharray="6 5"
                opacity="0.75"
              />
            )}

            {/* flowers */}
            {pts.map((pt) => {
              const hy = headY(pt.p)
              const bend = pt.d % 2 ? 4 : -4
              const on = tip?.d === pt.d
              const i = { ['--i' as string]: pt.d } as CSSProperties
              if (pt.n === 0) {
                return <ellipse key={pt.d} className="trend-dot" style={i} cx={x(pt.d)} cy={ground + 3.5} rx="3.4" ry="2.4" fill="var(--soil)" />
              }
              return (
                <g key={pt.d} className={on ? 'is-active' : undefined}>
                  <path
                    className="stem"
                    style={i}
                    d={`M${x(pt.d)},${ground + 2} Q${x(pt.d) + bend},${(ground + hy) / 2} ${x(pt.d)},${hy}`}
                    pathLength={1}
                    fill="none"
                    stroke="var(--leaf-2)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  {ground - hy > 46 && (
                    <ellipse
                      className="trend-dot"
                      style={i}
                      cx={x(pt.d) + bend * 1.5}
                      cy={(ground + hy) / 2 + 6}
                      rx="4.6"
                      ry="2.3"
                      fill="var(--leaf)"
                      transform={`rotate(${bend > 0 ? -32 : 32} ${x(pt.d) + bend * 1.5} ${(ground + hy) / 2 + 6})`}
                    />
                  )}
                  <g transform={`translate(${x(pt.d)} ${hy})`}>
                    <g className="bloom-head" style={i}>
                      <FlowerHead p={pt.p} />
                    </g>
                  </g>
                  {(on || isToday(pt.d)) && (
                    <text x={x(pt.d)} y={hy - 14} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="var(--ink)" className="num">
                      {pctText(pt.p)}
                    </text>
                  )}
                </g>
              )
            })}

            {/* average pill (above flowers & soil so it is never buried) */}
            {pts.length > 1 && (
              <g style={{ transform: `translateY(${avgPillY}px)`, transition: 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                <rect x={W - R + step / 2 - 54} y={-9} width="54" height="18" rx="9" fill="var(--accent)" />
                <text x={W - R + step / 2 - 27} y={3.6} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="var(--on-accent)" className="num">
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
                  {(now || on) && <rect x={x(d) - 10} y={H - 31} width="20" height="18" rx="9" fill={now ? 'var(--bloom)' : 'var(--surface-2)'} />}
                  <text
                    x={x(d)}
                    y={H - 18}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight={now || on ? 800 : 500}
                    fill={now ? 'var(--on-bloom)' : on ? 'var(--ink)' : 'var(--ink-3)'}
                    className="num"
                  >
                    {d}
                  </text>
                </g>
              )
            })}

            {/* hit areas */}
            {pts.map((pt) => (
              <rect
                key={pt.d}
                x={x(pt.d) - step / 2}
                y={T - 40}
                width={step}
                height={H - T + 40}
                fill="transparent"
                {...focus.hitProps(pt.d)}
              />
            ))}

            {!pts.length && (
              <text x={W / 2} y={(T + ground) / 2} textAnchor="middle" fontSize="13" fill="var(--ink-3)">
                {habitCount ? 'This month has not started yet' : 'Add a habit to see your meadow grow'}
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
              value={pctText(tip.p)}
              sub={`${tip.n} of ${habitCount} habits`}
              items={habits.map((h) => ({ id: h.id, emoji: h.emoji, name: h.name, done: !!checks[ck(h.id, tipKey)] }))}
              pinned={pinned === tip.d}
            />
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- weekday flower: seven petals, one per weekday, sized by that day's average ---------- */
export function WeekdayFlower({ stats }: { stats: MonthStats }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const vals = stats.perWeekday
  const best = vals.reduce<number>((b, v, i) => (v != null && v > 0 && (b < 0 || v > (vals[b] ?? 0)) ? i : b), -1)
  const shown = hovered ?? (best >= 0 ? best : null)

  const CX = 170
  const CY = 150
  const MIN = 40
  const MAX = 98
  const angle = (i: number) => -90 + (i * 360) / 7
  /** A petal pointing up from the flower's centre. */
  const petal = (len: number) => {
    const w = Math.min(30, len * 0.36)
    return `M0 0 C${w} ${-len * 0.3} ${w} ${-len * 0.86} 0 ${-len} C${-w} ${-len * 0.86} ${-w} ${-len * 0.3} 0 0 Z`
  }

  return (
    <section className="card rise flex flex-col p-5" style={{ ['--i' as string]: 7 }}>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[19px] font-bold">Weekday flower</h2>
        <span className="text-[13px] text-ink-3">{best >= 0 ? `Best: ${WEEKDAY_SHORT[best]}` : 'No data yet'}</span>
      </div>
      <p className="text-[12.5px] text-ink-3">Each petal is a weekday. Bigger petals are your stronger days.</p>

      <div className="flex flex-1 items-center justify-center" onPointerLeave={() => setHovered(null)}>
        <svg viewBox="0 0 340 356" className="block max-h-[370px] w-full" role="group" aria-label="Average completion by weekday">
          {/* stem and leaves, kept below the lowest weekday labels */}
          <path d={`M${CX} ${CY} C${CX + 6} ${CY + 70} ${CX - 8} ${CY + 130} ${CX} 356`} fill="none" stroke="var(--leaf-2)" strokeWidth="5" strokeLinecap="round" />
          <path d={`M${CX - 1} 330 C${CX - 34} 330 ${CX - 50} 310 ${CX - 48} 292 C${CX - 22} 294 ${CX - 4} 308 ${CX - 1} 330 Z`} fill="var(--leaf)" />
          <path d={`M${CX + 1} 344 C${CX + 30} 344 ${CX + 44} 328 ${CX + 42} 312 C${CX + 20} 314 ${CX + 4} 326 ${CX + 1} 344 Z`} fill="var(--leaf)" />

          {vals.map((v, i) => {
            const a = angle(i)
            const rad = (a * Math.PI) / 180
            const on = shown === i
            const len = v == null ? 0 : MIN + v * (MAX - MIN)
            const lx = CX + Math.cos(rad) * (MAX + 24)
            const ly = CY + Math.sin(rad) * (MAX + 20)
            const text = v == null ? 'No days yet' : `${pctText(v)} average`
            return (
              <g
                key={i}
                tabIndex={0}
                role="img"
                aria-label={`${WEEKDAY_SHORT[i]}: ${text}`}
                className="wd-petal-g"
                onPointerEnter={() => setHovered(i)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
              >
                <g transform={`translate(${CX} ${CY}) rotate(${a + 90})`}>
                  {/* full-size outline, so weaker days still read as petals */}
                  <path d={petal(MAX)} fill="var(--surface-2)" stroke="var(--line)" strokeWidth="1" />
                  {v != null && v > 0 && (
                    <path
                      className="wd-petal"
                      style={{ ['--i' as string]: i } as CSSProperties}
                      d={petal(len)}
                      fill={i === best ? 'var(--petal-3)' : 'var(--petal-2)'}
                      stroke={on ? 'var(--accent)' : 'none'}
                      strokeWidth="2"
                    />
                  )}
                </g>
                <text x={lx} y={ly} textAnchor="middle" fontSize="12" fontWeight={on ? 800 : 600} fill={on ? 'var(--ink)' : 'var(--ink-3)'}>
                  {WEEKDAY_SHORT[i]}
                </text>
                <text x={lx} y={ly + 13} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={on ? 'var(--ink)' : 'var(--ink-3)'} className="num">
                  {v == null ? '–' : pctText(v)}
                </text>
              </g>
            )
          })}

          {/* centre */}
          <circle cx={CX} cy={CY} r="31" fill="var(--gold)" />
          <circle cx={CX} cy={CY} r="26" fill="var(--surface)" />
          <text x={CX} y={CY - 1} textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--ink)" className="num font-display">
            {shown != null && vals[shown] != null ? pctText(vals[shown] as number) : '–'}
          </text>
          <text x={CX} y={CY + 12} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--ink-3)">
            {shown != null ? WEEKDAY_SHORT[shown] : 'no data'}
          </text>
        </svg>
      </div>
    </section>
  )
}

export function GardenHero(props: {
  stats: MonthStats
  state: State
  todayDone: number
  isCurrentMonth: boolean
  year: number
  month: number
  today: Today
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <GardenCard stats={props.stats} todayDone={props.todayDone} habitCount={props.state.habits.length} isCurrentMonth={props.isCurrentMonth} />
      <Meadow stats={props.stats} state={props.state} year={props.year} month={props.month} today={props.today} />
    </div>
  )
}

/* ---------- weekly blooms: garden version of Progress per week ---------- */
function BloomRing({ pct, index, crown = false }: { pct: number; index: number; crown?: boolean }) {
  const petals = crown ? 12 : 10
  const lit = pct <= 0 ? 0 : Math.max(1, Math.round(pct * petals))
  const full = pct >= 1

  return (
    <svg width="96" height="92" viewBox="0 0 100 94" aria-hidden="true">
      {!crown && (
        <>
          <path
            className="wk-leaf-l"
            style={{ transformOrigin: '48px 79px' }}
            d="M48 79 C36 80 32 73 35 68 C42 69 46 74 48 79 Z"
            fill="var(--leaf)"
            opacity="0.9"
          />
          <path
            className="wk-leaf-r"
            style={{ transformOrigin: '52px 79px' }}
            d="M52 79 C64 80 68 73 65 68 C58 69 54 74 52 79 Z"
            fill="var(--leaf-2)"
            opacity="0.86"
          />
        </>
      )}

      <g className="wk-flower-hover" style={{ transformOrigin: '50px 46px' }}>
        <g
          className={crown ? 'wk-crown-ring' : 'wk-petal-ring'}
          style={{ transformOrigin: '50px 46px', ['--i' as string]: index } as CSSProperties}
        >
          {Array.from({ length: petals }, (_, i) => {
            const on = i < lit
            const angle = (i * 360) / petals
            const fill = crown
              ? on
                ? i % 2
                  ? 'var(--gold)'
                  : 'var(--petal-1)'
                : 'rgb(255 255 255 / 0.16)'
              : on
                ? 'var(--wk)'
                : 'var(--wk-line)'
            const fillOpacity = on ? (crown || i % 2 === 0 ? 1 : 0.9) : crown ? 1 : 0.46
            return (
              <path
                key={i}
                d="M0,-23 C6,-27 7,-39 0,-42 C-7,-39 -6,-27 0,-23 Z"
                fill={fill}
                fillOpacity={fillOpacity}
                transform={`translate(50 46) rotate(${angle})`}
                style={{ transition: 'fill 0.35s ease, fill-opacity 0.35s ease' }}
              />
            )
          })}
        </g>
      </g>

      <circle
        cx="50"
        cy="46"
        r="21"
        fill={crown ? 'var(--panel)' : 'var(--surface)'}
        stroke={crown ? 'var(--gold)' : 'var(--wk-line)'}
        strokeWidth="1.8"
        strokeOpacity={pct > 0 ? 0.85 : 0.55}
      />
      <text
        x="50"
        y="51.5"
        textAnchor="middle"
        fontSize="17"
        fontWeight="800"
        fill={crown ? '#ffffff' : 'var(--wk-deep)'}
        className="num font-display"
      >
        {pctText(pct)}
      </text>
      {full && <path className="twinkle" d="M84 14 l1.3 3 3 1.3 -3 1.3 -1.3 3 -1.3 -3 -3 -1.3 3 -1.3 Z" fill="var(--gold)" />}
    </svg>
  )
}

export function WeeklyBlooms({ stats, month, className = '' }: { stats: MonthStats; month: number; className?: string }) {
  const mon = MONTHS[month].slice(0, 3)
  return (
    <section className={`card rise flex flex-col p-5 ${className}`} style={{ ['--i' as string]: 8 }}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[17px] font-bold">Progress per week</h2>
        <span className="text-[12.5px] text-ink-3">Share of all habit slots ticked</span>
      </div>

      <div className="my-auto grid grid-cols-3 gap-3 xl:grid-cols-6">
        {stats.perWeek.map(({ week, done, possible, pct }) => (
          <div key={week.index} className={`wk-tile wk-${week.index + 1} flex flex-col items-center rounded-2xl bg-(--wk-soft) px-3 py-4`}>
            <BloomRing pct={pct} index={week.index} />
            <div className="mt-2.5 text-[13px] font-bold text-(--wk-deep)">Week {week.index + 1}</div>
            <div className="num text-[11.5px] text-(--wk-deep) opacity-75">
              {mon} {week.start}–{week.end} · {done}/{possible}
            </div>
          </div>
        ))}
        <div className="wk-tile flex flex-col items-center rounded-2xl bg-panel px-3 py-4 text-white">
          <BloomRing pct={stats.monthPct} index={5} crown />
          <div className="mt-2.5 text-[13px] font-bold">Whole month</div>
          <div className="num text-[11.5px] opacity-75">
            {stats.monthDone}/{stats.monthGoal} goal days
          </div>
        </div>
      </div>
    </section>
  )
}
