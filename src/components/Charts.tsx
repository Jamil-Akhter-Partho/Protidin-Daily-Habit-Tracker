import type { ReactNode } from 'react'
import { MONTHS, WEEKDAY_SHORT } from '../lib/date'
import type { MonthStats } from '../lib/stats'

export function Donut({
  value,
  size = 96,
  stroke = 11,
  color,
  track,
  children,
}: {
  value: number
  size?: number
  stroke?: number
  color: string
  track: string
  children?: ReactNode
}) {
  const v = Math.max(0, Math.min(1, value))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          className="donut-arc"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          opacity={v === 0 ? 0 : 1}
        />
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center">{children}</div>}
    </div>
  )
}

const pctText = (v: number) => `${Math.round(v * 100)}%`

function ChartCard({ i, title, hint, children, className = '' }: { i: number; title: string; hint: string; children: ReactNode; className?: string }) {
  return (
    <section className={`card rise flex flex-col p-5 ${className}`} style={{ ['--i' as string]: i }}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[17px] font-bold">{title}</h2>
        <span className="text-[12.5px] text-ink-3">{hint}</span>
      </div>
      {children}
    </section>
  )
}

/* ---------- weekly donuts ---------- */
export function WeeklyDonuts({ stats, month, className }: { stats: MonthStats; month: number; className?: string }) {
  const mon = MONTHS[month].slice(0, 3)
  return (
    <ChartCard i={8} className={className} title="Progress per week" hint="Share of all habit slots ticked">
      <div className="my-auto grid grid-cols-3 gap-3 xl:grid-cols-6">
        {stats.perWeek.map(({ week, done, possible, pct }) => (
          <div key={week.index} className={`wk-${week.index + 1} flex flex-col items-center rounded-2xl bg-(--wk-soft) px-3 py-4`}>
            <Donut value={pct} color="var(--wk)" track="var(--surface)">
              <span className="num font-display text-[19px] font-extrabold text-(--wk-deep)">{pctText(pct)}</span>
            </Donut>
            <div className="mt-3 text-[13px] font-bold text-(--wk-deep)">Week {week.index + 1}</div>
            <div className="num text-[11.5px] text-(--wk-deep) opacity-75">
              {mon} {week.start}–{week.end} · {done}/{possible}
            </div>
          </div>
        ))}
        <div className="flex flex-col items-center rounded-2xl bg-panel px-3 py-4 text-white">
          <Donut value={stats.monthPct} color="var(--gold)" track="rgb(255 255 255 / 0.14)">
            <span className="num font-display text-[19px] font-extrabold">{pctText(stats.monthPct)}</span>
          </Donut>
          <div className="mt-3 text-[13px] font-bold">Whole month</div>
          <div className="num text-[11.5px] opacity-75">
            {stats.monthDone}/{stats.monthGoal} goal days
          </div>
        </div>
      </div>
    </ChartCard>
  )
}

/* ---------- weekday strength (bar chart) ---------- */
export function WeekdayChart({ stats }: { stats: MonthStats }) {
  const vals = stats.perWeekday
  const best = vals.reduce<number>((b, v, i) => (v != null && v > 0 && (b < 0 || v > (vals[b] ?? 0)) ? i : b), -1)
  return (
    <ChartCard i={7} title="Strongest weekdays" hint={best >= 0 ? `Best: ${WEEKDAY_SHORT[best]}` : 'No data yet'}>
      <div className="flex min-h-[196px] flex-1 items-end gap-2.5">
        {vals.map((v, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5" title={v == null ? 'No days yet' : `${WEEKDAY_SHORT[i]}: ${pctText(v)} average`}>
            <span className={`num text-[11.5px] font-bold ${i === best ? 'text-ink' : 'text-ink-3'}`}>{v == null ? '' : pctText(v)}</span>
            <div className="flex w-full flex-1 items-end rounded-xl bg-surface-2">
              <div
                className="vbar w-full rounded-xl"
                style={{
                  ['--i' as string]: i,
                  height: `${Math.max(v ?? 0, v ? 0.04 : 0) * 100}%`,
                  background: i === best ? 'var(--gold)' : 'var(--accent)',
                  opacity: i === best ? 1 : 0.82,
                }}
              />
            </div>
            <span className={`text-[12px] font-semibold ${i === best ? 'text-ink' : 'text-ink-3'}`}>{WEEKDAY_SHORT[i]}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}
