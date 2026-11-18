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

export function ChronometerDial({
  value,
  size = 88,
  color,
  track,
  tickColor,
  children,
}: {
  value: number
  size?: number
  color: string
  track: string
  tickColor?: string
  children?: ReactNode
}) {
  const v = Math.max(0, Math.min(1, value))
  const cx = size / 2
  const cy = size / 2
  const rTrack = 27
  const c = 2 * Math.PI * rTrack

  // 12 ticks at 30-degree intervals (starting from 12 o'clock / -90 deg)
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const rad = (i * 30 - 90) * (Math.PI / 180)
    const isMajor = i % 3 === 0
    const rOuter = 38
    const rInner = isMajor ? 32 : 34.5
    return {
      x1: cx + rOuter * Math.cos(rad),
      y1: cy + rOuter * Math.sin(rad),
      x2: cx + rInner * Math.cos(rad),
      y2: cy + rInner * Math.sin(rad),
      isMajor,
    }
  })

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="overflow-visible">
        {/* Outer subtle bezel ring */}
        <circle
          cx={cx}
          cy={cy}
          r={38.5}
          fill="none"
          stroke={tickColor ?? 'currentColor'}
          strokeWidth={0.75}
          opacity={0.25}
        />

        {/* 12 Chronometer Calibration Ticks */}
        {ticks.map((t, idx) => (
          <line
            key={idx}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={tickColor ?? 'currentColor'}
            strokeWidth={t.isMajor ? 1.5 : 0.85}
            strokeLinecap="round"
            opacity={t.isMajor ? 0.75 : 0.4}
          />
        ))}

        {/* Dashed vintage calibration track */}
        <circle
          cx={cx}
          cy={cy}
          r={rTrack}
          fill="none"
          stroke={track}
          strokeWidth={4}
          strokeDasharray="2.5 3"
        />

        {/* Dynamic Progress Arc */}
        <circle
          className="donut-arc"
          cx={cx}
          cy={cy}
          r={rTrack}
          fill="none"
          stroke={color}
          strokeWidth={4.8}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          transform={`rotate(-90 ${cx} ${cy})`}
          opacity={v === 0 ? 0 : 1}
        />
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center text-center">{children}</div>}
    </div>
  )
}

const pctText = (v: number) => `${Math.round(v * 100)}%`

function ChartCard({
  i,
  title,
  hint,
  badge = 'Weekly Index',
  subtitle,
  children,
  className = '',
}: {
  i: number
  title: string
  hint: string
  badge?: string
  subtitle?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`gazette-card rise flex flex-col p-5 ${className}`} style={{ ['--i' as string]: i }}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[17px] font-bold text-ink">{title}</h2>
            <span className="rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-ink-3">
              {badge}
            </span>
          </div>
          {subtitle && <p className="mt-0.5 text-[12px] text-ink-3">{subtitle}</p>}
        </div>
        <span className="num text-[12px] font-bold text-ink-3">{hint}</span>
      </div>
      {children}
    </section>
  )
}

/* ---------- weekly donuts ---------- */
export function WeeklyDonuts({ stats, month, className }: { stats: MonthStats; month: number; className?: string }) {
  const mon = MONTHS[month].slice(0, 3)
  return (
    <ChartCard
      i={8}
      className={className}
      title="Progress per week"
      badge="Weekly Ledger"
      subtitle="Share of all habit slots ticked across weeks"
      hint={`${mon} summary`}
    >
      <div className="gazette-inner my-auto grid grid-cols-2 gap-3 p-3.5 sm:grid-cols-3 xl:grid-cols-6">
        {stats.perWeek.map(({ week, done, possible, pct }) => (
          <div
            key={week.index}
            className={`wk-${week.index + 1} group relative flex flex-col items-center justify-between rounded-xl bg-(--wk-soft) p-3.5 border border-(--wk-line)/60 shadow-xs transition-all duration-300 hover:shadow-md hover:border-(--wk-line)`}
          >
            <ChronometerDial
              value={pct}
              color="var(--wk)"
              track="color-mix(in srgb, var(--wk-deep) 16%, transparent)"
              tickColor="color-mix(in srgb, var(--wk-deep) 42%, transparent)"
            >
              <span className="num font-display text-[17px] font-black text-(--wk-deep) tracking-tight">
                {pctText(pct)}
              </span>
            </ChronometerDial>
            <div className="mt-3 text-center">
              <div className="font-display text-[13px] font-bold text-(--wk-deep) tracking-tight">
                Week {week.index + 1}
              </div>
              <div className="num mt-0.5 text-[11px] font-semibold text-(--wk-deep) opacity-80">
                {mon} {week.start}–{week.end} · {done}/{possible}
              </div>
            </div>
          </div>
        ))}
        <div className="group relative flex flex-col items-center justify-between rounded-xl bg-panel p-3.5 text-white shadow-xs border border-white/15 transition-all duration-300 hover:shadow-md hover:border-white/25">
          <ChronometerDial
            value={stats.monthPct}
            color="var(--gold)"
            track="rgba(255, 255, 255, 0.14)"
            tickColor="rgba(255, 255, 255, 0.45)"
          >
            <span className="num font-display text-[17px] font-black text-gold tracking-tight">
              {pctText(stats.monthPct)}
            </span>
          </ChronometerDial>
          <div className="mt-3 text-center">
            <div className="font-display text-[13px] font-bold tracking-tight text-white">Whole month</div>
            <div className="num mt-0.5 text-[11px] font-semibold text-white/80">
              {stats.monthDone}/{stats.monthGoal} goal days
            </div>
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
    <ChartCard
      i={7}
      title="Strongest weekdays"
      badge="Weekly Index"
      subtitle="Consistency across calendar days"
      hint={best >= 0 ? `Best: ${WEEKDAY_SHORT[best]}` : 'No data yet'}
    >
      <div className="gazette-inner flex min-h-[196px] flex-1 items-end gap-2.5 p-3.5">
        {vals.map((v, i) => {
          const isTop = i === best && v != null && v > 0
          return (
            <div
              key={i}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              title={v == null ? 'No days yet' : `${WEEKDAY_SHORT[i]}: ${pctText(v)} average`}
            >
              <span className={`num text-[11px] font-bold ${isTop ? 'text-gold' : 'text-ink-3'}`}>
                {isTop ? '★ ' : ''}
                {v == null ? '' : pctText(v)}
              </span>
              <div
                className={`relative flex w-full flex-1 items-end overflow-hidden rounded-xl border ${
                  isTop ? 'border-(--gold)/70 shadow-xs' : 'border-line/70'
                } bg-surface`}
              >
                {/* Vintage calibration tick marks */}
                <div className="pointer-events-none absolute inset-x-0 top-1/4 border-t border-ink-3/15" />
                <div className="pointer-events-none absolute inset-x-0 top-2/4 border-t border-ink-3/25" />
                <div className="pointer-events-none absolute inset-x-0 top-3/4 border-t border-ink-3/15" />

                <div
                  className="vbar w-full rounded-b-lg transition-all duration-700"
                  style={{
                    ['--i' as string]: i,
                    height: `${Math.max(v ?? 0, v ? 0.05 : 0) * 100}%`,
                    background: isTop
                      ? 'linear-gradient(180deg, var(--gold) 0%, color-mix(in srgb, var(--gold) 75%, #000) 100%)'
                      : 'linear-gradient(180deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 80%, #000) 100%)',
                    opacity: isTop ? 1 : 0.82,
                    boxShadow: isTop ? '0 0 10px color-mix(in srgb, var(--gold) 35%, transparent)' : undefined,
                  }}
                />
              </div>
              <span className={`text-[12px] font-bold ${isTop ? 'text-ink' : 'text-ink-3'}`}>
                {WEEKDAY_SHORT[i]}
              </span>
            </div>
          )
        })}
      </div>
    </ChartCard>
  )
}
