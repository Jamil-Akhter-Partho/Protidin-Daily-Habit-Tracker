import { ArrowDown, ArrowUp, Flame, Pencil, Plus } from 'lucide-react'
import { dateKey, MONTHS, WEEKDAY_LETTERS, type Today } from '../lib/date'
import type { MonthStats } from '../lib/stats'
import { ck, type Habit, type State } from '../lib/store'
import { Plant, plantStage } from './Plant'
import { NoorLantern } from './Noor'

export function HabitGrid({
  stats,
  checks,
  year,
  month,
  today,
  onToggle,
  onEdit,
  onMove,
  onAdd,
  garden = false,
  noor = false,
}: {
  /** Garden style: show a plant above each day that grows with that day's progress. */
  garden?: boolean
  /** Noor style: show a glowing barakah lantern above each day. */
  noor?: boolean
  stats: MonthStats
  checks: State['checks']
  year: number
  month: number
  today: Today
  onToggle: (id: string, date: string, el: HTMLElement) => void
  onEdit: (h: Habit) => void
  onMove: (id: string, dir: -1 | 1) => void
  onAdd: () => void
}) {
  const { weeks, dim, perHabit, perDay } = stats
  const habitCount = perHabit.length
  const cols = `clamp(190px, 15vw, 250px) ${weeks
    .map((w) => `minmax(0, ${w.end - w.start + 1}fr)`)
    .join(' ')} 246px`
  const style = { gridTemplateColumns: cols }
  const inner = (len: number) => ({ gridTemplateColumns: `repeat(${len}, minmax(0, 1fr))` })
  const days = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => start + i)

  if (!habitCount) {
    return (
      <section className="card rise grid place-items-center px-6 py-16 text-center" style={{ ['--i' as string]: 5 }}>
        <div className="mb-3 text-4xl">🌱</div>
        <h2 className="font-display text-xl font-bold">No habits yet</h2>
        <p className="mt-1 max-w-sm text-ink-2">Add your first habit and start ticking off the days.</p>
        <button className="btn btn-primary mt-5" onClick={onAdd}>
          <Plus size={17} /> New habit
        </button>
      </section>
    )
  }

  return (
    <section className="card rise overflow-x-auto p-5" style={{ ['--i' as string]: 5 }} aria-label="Habit grid">
      <div style={{ minWidth: 1180 }}>
        {garden && (
          <div className="hgrid" style={style} aria-hidden="true">
            <div className="flex items-end pb-2 pl-2 text-[12px] font-bold text-ink-3">Your garden</div>
            {weeks.map((w) => (
              <div key={w.index} className="grid" style={inner(w.end - w.start + 1)}>
                {days(w.start, w.end).map((d) => (
                  <div key={d} className="plant-slot">
                    {dateKey(year, month, d) <= today.key && <Plant stage={plantStage(perDay[d - 1], habitCount)} size={42} />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {noor && (
          <div className="hgrid" style={style} aria-hidden="true">
            <div className="flex items-end pb-2 pl-2 text-[12px] font-extrabold text-(--accent)">
              ✨ Barakah
            </div>
            {weeks.map((w) => (
              <div key={w.index} className="grid" style={inner(w.end - w.start + 1)}>
                {days(w.start, w.end).map((d) => (
                  <div key={d} className="plant-slot">
                    {dateKey(year, month, d) <= today.key && (
                      <NoorLantern stage={plantStage(perDay[d - 1], habitCount)} size={38} />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* header */}
        <div className="hgrid" style={style}>
          <div className="hab-head flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-ink">Habits</span>
              <span className="num rounded-md border border-line bg-surface px-1.5 py-0.5 text-[9.5px] font-bold text-ink-2 shadow-xs">
                {habitCount} Total
              </span>
            </div>
            <div className="flex items-center text-[10px] font-medium text-ink-3">
              <span>Daily habits list</span>
            </div>
          </div>
          {weeks.map((w) => (
            <div key={w.index} className={`wkblock wkhead wk-${w.index + 1}`} style={inner(w.end - w.start + 1)}>
              <div
                className="pb-1 text-center text-[11.5px] font-extrabold uppercase tracking-wider text-(--wk-deep)"
                style={{ gridColumn: '1 / -1' }}
              >
                Week {w.index + 1}
              </div>
              {days(w.start, w.end).map((d) => {
                const isToday = dateKey(year, month, d) === today.key
                return (
                  <div key={d} className="flex flex-col items-center gap-0.5 pb-1.5">
                    <span className="text-[10px] font-semibold text-(--wk-deep) opacity-60">
                      {WEEKDAY_LETTERS[new Date(year, month, d).getDay()]}
                    </span>
                    <span
                      className={`num grid size-[22px] place-items-center rounded-full text-[11.5px] font-bold ${
                        isToday ? 'bg-(--wk-deep) text-(--wk-soft) shadow' : 'text-(--wk-deep)'
                      }`}
                      aria-current={isToday ? 'date' : undefined}
                    >
                      {d}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
          <div
            className={`sum-block sum-head grid items-center px-1 text-center ${
              noor
                ? 'grid-cols-[66px_1fr_64px] noor-sum-head overflow-hidden py-1'
                : 'grid-cols-[62px_1fr_50px]'
            }`}
          >
            {noor ? (
              <>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[12px] leading-none">🎯</span>
                  <span className="mt-0.5 text-[9.5px] font-extrabold uppercase tracking-tight text-ink-2">Niyyah</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[12px] leading-none">✨</span>
                  <span className="mt-0.5 text-[9.5px] font-extrabold uppercase tracking-tight text-ink-2">Radiance</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[12px] leading-none">🔥</span>
                  <span className="mt-0.5 text-[9.5px] font-extrabold uppercase tracking-tight text-ink-2">Istiqamah</span>
                </div>
              </>
            ) : (
              <>
                <div className="pb-1 text-[11px] font-extrabold uppercase tracking-wider text-ink-2">Goal</div>
                <div className="pb-1 text-[11px] font-extrabold uppercase tracking-wider text-ink-2">Progress</div>
                <div className="pb-1 text-[11px] font-extrabold uppercase tracking-wider text-ink-2">Streak</div>
              </>
            )}
          </div>
        </div>

        {/* rows */}
        {perHabit.map(({ habit, done, goal, pct, streak }, i) => (
          <div key={habit.id} className="hgrid hrow" style={style}>
            <div className="hname relative flex min-w-0 items-center gap-2.5 px-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface-2 border border-line/60 text-[15px] shadow-xs">
                {habit.emoji}
              </span>
              <span className="truncate text-[13px] font-semibold text-ink" title={habit.name}>
                {habit.name}
              </span>
              <div className="row-actions absolute inset-y-0 right-1 flex items-center rounded-r-xl bg-surface-2 pl-1">
                <button className="icon-btn !size-7" onClick={() => onMove(habit.id, -1)} disabled={i === 0} aria-label={`Move ${habit.name} up`}>
                  <ArrowUp size={14} />
                </button>
                <button
                  className="icon-btn !size-7"
                  onClick={() => onMove(habit.id, 1)}
                  disabled={i === habitCount - 1}
                  aria-label={`Move ${habit.name} down`}
                >
                  <ArrowDown size={14} />
                </button>
                <button className="icon-btn !size-7" onClick={() => onEdit(habit)} aria-label={`Edit ${habit.name}`}>
                  <Pencil size={14} />
                </button>
              </div>
            </div>

            {weeks.map((w) => (
              <div key={w.index} className={`wkblock wk-${w.index + 1}`} style={inner(w.end - w.start + 1)}>
                {days(w.start, w.end).map((d) => {
                  const date = dateKey(year, month, d)
                  const on = !!checks[ck(habit.id, date)]
                  return (
                    <button
                      key={d}
                      role="checkbox"
                      aria-checked={on}
                      aria-label={`${habit.name}, ${MONTHS[month]} ${d}`}
                      disabled={date > today.key}
                      className={`cell ${date === today.key ? 'is-today' : ''}`}
                      onClick={(e) => onToggle(habit.id, date, e.currentTarget)}
                    >
                      <span className="box">
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                          <path d="M3.5 8.5l3 3 6-7" />
                        </svg>
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}

            <div
              className={`sum-block sum-row grid items-center px-1.5 py-1 ${
                noor ? 'grid-cols-[66px_1fr_64px] noor-sum-row' : 'grid-cols-[62px_1fr_50px]'
              }`}
            >
              <div className="num flex items-center justify-center">
                <span className={`goal-badge text-[12px] font-bold ${noor ? 'noor-niyyah-badge' : ''}`}>
                  {done}<span className="text-[10.5px] opacity-60">/{goal}</span>
                </span>
              </div>
              <div className="flex flex-col justify-center px-2 min-w-0">
                <div className="bar-track h-2 w-full overflow-hidden rounded-full bg-black/20 dark:bg-white/10">
                  <div
                    className={`bar-fill h-full rounded-full transition-all duration-500 ${
                      noor
                        ? pct >= 1
                          ? 'shimmer-done'
                          : 'shimmer-gold'
                        : pct >= 1
                          ? 'is-done'
                          : ''
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round(pct * 100))}%`,
                      background: noor
                        ? undefined
                        : pct >= 1
                          ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                          : 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)',
                      boxShadow: noor
                        ? pct >= 1
                          ? '0 0 10px rgba(16, 185, 129, 0.45)'
                          : '0 0 8px rgba(250, 204, 21, 0.4)'
                        : pct >= 1
                          ? '0 0 10px rgba(16, 185, 129, 0.45)'
                          : '0 0 8px rgba(6, 182, 212, 0.35)',
                    }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10.5px] font-semibold">
                  <span className={`num font-bold ${pct >= 1 ? (noor ? 'text-(--gold)' : 'text-good') : 'text-ink-2'}`}>
                    {Math.round(pct * 100)}%
                  </span>
                  {pct >= 1 ? (
                    <span className="text-[9.5px] font-extrabold text-good">
                      {noor ? 'Done! ۞' : 'Done! ✨'}
                    </span>
                  ) : goal && goal > done ? (
                    <span className="num text-[9.5px] text-ink-3">{goal - done} left</span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center justify-center">
                {streak ? (
                  <span
                    className={`streak-badge inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-black ${
                      noor ? 'noor-istiqamah-badge' : ''
                    }`}
                    title={`${streak}-day streak`}
                  >
                    <Flame size={12} fill="currentColor" /> {streak}
                  </span>
                ) : (
                  <span className="num text-[12px] font-bold text-ink-3/40">–</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* daily totals */}
        <div className="hgrid" style={style}>
          <div className="hab-foot flex items-center justify-between">
            <span className="text-[11.5px] font-bold text-ink-2">Done per day</span>
            <span className="text-[9.5px] font-semibold text-ink-3 opacity-80">Daily total</span>
          </div>
          {weeks.map((w) => (
            <div key={w.index} className={`wkblock wkfoot wk-${w.index + 1}`} style={inner(w.end - w.start + 1)}>
              {days(w.start, w.end).map((d) => {
                const n = perDay[d - 1]
                const future = dateKey(year, month, d) > today.key
                return (
                  <div key={d} className="flex flex-col items-center gap-1 pt-2" title={future ? undefined : `${MONTHS[month]} ${d}: ${n} of ${habitCount}`}>
                    <div className="flex h-7 w-[9px] items-end overflow-hidden rounded-full bg-(--wk-well)">
                      <div
                        className="w-full rounded-full bg-(--wk) transition-[height] duration-500"
                        style={{ height: `${(n / habitCount) * 100}%` }}
                      />
                    </div>
                    <span className={`num text-[10.5px] font-bold text-(--wk-deep) ${future ? 'opacity-0' : ''}`}>{n}</span>
                  </div>
                )
              })}
            </div>
          ))}
          <div className={`sum-block sum-foot flex items-center justify-center px-2 py-2 ${noor ? 'noor-sum-foot' : ''}`}>
            <span className={`sum-total-pill num inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-xs ${noor ? 'noor-sum-pill' : ''}`}>
              <span>{noor ? '۞ ' : ''}{perDay.reduce((a, b) => a + b, 0)}</span>
              <span className="opacity-75">{noor ? 'deeds' : 'ticks'} in {dim}d</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
