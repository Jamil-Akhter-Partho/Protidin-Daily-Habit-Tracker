import { ArrowDown, ArrowUp, Flame, Pencil, Plus } from 'lucide-react'
import { dateKey, MONTHS, WEEKDAY_LETTERS, type Today } from '../lib/date'
import type { MonthStats } from '../lib/stats'
import { ck, type Habit, type State } from '../lib/store'
import { Plant, plantStage } from './Plant'

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
}: {
  /** Garden style: show a plant above each day that grows with that day's progress. */
  garden?: boolean
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
    .join(' ')} 58px 124px 46px`
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

        {/* header */}
        <div className="hgrid" style={style}>
          <div className="flex items-end pb-2 pl-2 text-[12px] font-bold uppercase tracking-wider text-ink-3">Habits</div>
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
          {['Goal', 'Progress', 'Streak'].map((t) => (
            <div key={t} className="flex items-end justify-center pb-2 text-[12px] font-bold uppercase tracking-wider text-ink-3">
              {t}
            </div>
          ))}
        </div>

        {/* rows */}
        {perHabit.map(({ habit, done, goal, pct, streak }, i) => (
          <div key={habit.id} className="hgrid hrow" style={style}>
            <div className="hname relative flex min-w-0 items-center gap-2.5 pl-2 pr-1">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-[15px]">{habit.emoji}</span>
              <span className="truncate text-[13.5px] font-semibold" title={habit.name}>
                {habit.name}
              </span>
              <div className="row-actions absolute inset-y-0 right-0 flex items-center rounded-r-xl bg-surface-2 pl-1">
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

            <div className="num flex items-center justify-center text-[13px]">
              <span className="font-bold">{done}</span>
              <span className="text-ink-3">/{goal}</span>
            </div>
            <div className="flex items-center gap-2 px-1">
              <div className="bar-track flex-1">
                <div className={`bar-fill ${pct >= 1 ? 'is-done' : ''}`} style={{ width: `${pct * 100}%` }} />
              </div>
              <span className="num w-9 text-right text-[12px] font-semibold text-ink-2">{Math.round(pct * 100)}%</span>
            </div>
            <div
              className={`num flex items-center justify-center gap-0.5 text-[13px] font-bold ${streak ? 'text-flame' : 'text-ink-3'}`}
              title={streak ? `${streak}-day streak` : 'No active streak'}
            >
              {streak ? (
                <>
                  <Flame size={14} fill="currentColor" /> {streak}
                </>
              ) : (
                '–'
              )}
            </div>
          </div>
        ))}

        {/* daily totals */}
        <div className="hgrid" style={style}>
          <div className="flex items-center pl-2 text-[12px] font-semibold text-ink-3">Done per day</div>
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
          <div className="col-span-3 flex items-center justify-end pr-2 text-[12px] text-ink-3">
            <span className="num">
              {perDay.reduce((a, b) => a + b, 0)} ticks in {dim} days
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
