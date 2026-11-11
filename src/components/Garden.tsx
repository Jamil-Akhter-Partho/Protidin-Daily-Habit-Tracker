import { useState, type CSSProperties } from 'react'
import { dateKey, MONTHS, WEEKDAY_SHORT, type Today } from '../lib/date'
import { useCountUp } from '../lib/hooks'
import type { MonthStats } from '../lib/stats'
import { ck, type State } from '../lib/store'
import { DayTip, useDayFocus } from './DayFocus'
import { Plant, plantStage } from './Plant'

const pctText = (v: number) => `${Math.round(v * 100)}%`

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

  const pills = [
    { label: 'Today', value: `${todayDone}/${habitCount}` },
    { label: 'Monthly goals', value: pctText(stats.monthPct) },
    { label: 'Best streak', value: `${top}d` },
  ]

  return (
    <section className="card rise flex flex-col overflow-hidden" style={{ ['--i' as string]: 1 }} aria-label="Your garden">
      <div className="garden-banner px-5 py-4 text-center">
        <div className="text-[13px] font-bold opacity-90">You planted</div>
        <div className="font-display text-[30px] font-bold leading-tight">
          <span className="num">{trees}</span> {stats.perfectDays === 1 ? 'tree' : 'trees'} this month
        </div>
      </div>

      <div className="garden-scene relative flex min-h-[232px] flex-1 items-end justify-center overflow-hidden">
        <div className="garden-hill" />
        {stage === 5 &&
          Array.from({ length: 9 }, (_, i) => (
            <span
              key={i}
              className="petal-fall"
              style={{ ['--i' as string]: i, left: `${12 + ((i * 37) % 76)}%` } as CSSProperties}
            />
          ))}
        <div className="relative pb-3">
          <Plant stage={stage} size={164} sway soil />
        </div>
      </div>

      <p className="px-5 pt-3 text-center text-[13.5px] font-semibold text-ink-2">{caption}</p>

      <div className="grid grid-cols-3 gap-2 p-4">
        {pills.map((p) => (
          <div key={p.label} className="rounded-2xl bg-surface-2 px-2 py-2.5 text-center">
            <div className="num font-display text-[20px] font-bold leading-none">{p.value}</div>
            <div className="mt-1 text-[11.5px] text-ink-3">{p.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------- flower meadow: one flower per day, height = that day's completion ---------- */
const PETAL_ANGLES = [0, 72, 144, 216, 288].map((a) => ((a - 90) * Math.PI) / 180)

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

  const chips = [
    { label: 'Daily average', value: pts.length ? pctText(avg) : '–' },
    { label: 'Best day', value: best ? `${mon} ${best.d}` : '–' },
    { label: 'Full blooms', value: String(blooms) },
  ]

  return (
    <section className="card rise flex flex-col p-5" style={{ ['--i' as string]: 2 }}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[19px] font-bold">Flower meadow</h2>
          <p className="text-[12.5px] text-ink-3">One flower a day. The more you finish, the taller it grows.</p>
        </div>
        <div className="flex gap-2">
          {chips.map((c) => (
            <div key={c.label} className="rounded-2xl bg-surface-2 px-3 py-1.5 text-center">
              <div className="num font-display text-[16px] font-bold leading-tight">{c.value}</div>
              <div className="text-[10.5px] text-ink-3">{c.label}</div>
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

            {/* average line */}
            {pts.length > 1 && (
              <g>
                <line x1={L - step / 2} x2={W - R + step / 2} y1={y(avg)} y2={y(avg)} stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="6 5" opacity="0.75" />
                <rect x={W - R + step / 2 - 54} y={y(avg) - 9} width="54" height="18" rx="9" fill="var(--accent)" />
                <text x={W - R + step / 2 - 27} y={y(avg) + 3.6} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="var(--on-accent)" className="num">
                  avg {pctText(avg)}
                </text>
              </g>
            )}

            {/* soil */}
            <rect x={L - step / 2} y={ground - 1} width={W - L - R + step} height="9" rx="4.5" fill="var(--hill)" />

            {/* future days: empty plots */}
            {Array.from({ length: dim - pts.length }, (_, i) => pts.length + i + 1).map((d) => (
              <circle key={d} cx={x(d)} cy={ground + 3.5} r="1.6" fill="var(--soil)" opacity="0.55" />
            ))}

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
