import { useEffect, useMemo, useState } from 'react'
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Flame,
  Pencil,
  Plus,
} from 'lucide-react'
import {
  dateKey,
  MONTHS,
  WEEKDAY_LETTERS,
  WEEKDAY_SHORT,
  type Today,
} from '../lib/date'
import type { MonthStats } from '../lib/stats'
import { ck, type Habit, type State } from '../lib/store'
import type { ThemeState } from '../lib/theme'
import { Plant, plantStage } from './Plant'
import { NoorLantern } from './Noor'
import { getHijriDate } from '../lib/hijri'

const PALETTE = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f43f5e', // rose
  '#6366f1', // indigo
]

export function MobileHabitView({
  stats,
  state,
  year,
  month,
  today,
  theme,
  todayDone,
  isCurrentMonth,
  onToggle,
  onEdit,
  onAdd,
  onSwitchToDesktop,
}: {
  stats: MonthStats
  state: State
  year: number
  month: number
  today: Today
  theme: ThemeState
  todayDone: number
  isCurrentMonth: boolean
  onToggle: (id: string, date: string, el: HTMLElement) => void
  onEdit: (h: Habit) => void
  onAdd: () => void
  onSwitchToDesktop?: () => void
}) {
  const { weeks, dim, perHabit } = stats
  const habits = state.habits
  const habitCount = habits.length
  const garden = theme.style === 'garden'
  const noor = theme.style === 'noor'

  // View tabs: 'weekly' (default, 7-day bubbles) | 'today' (quick checklist) | 'overall' (5-row squircle heatmap)
  const [activeTab, setActiveTab] = useState<'weekly' | 'today' | 'overall'>('weekly')

  // Left-to-Right Wave Scanner Trigger for Overall tab (GPU-optimized, zero-remount)
  const [isScanning, setIsScanning] = useState(false)

  // Smoothly trigger wave scan after entering overall tab without delaying tab paint
  useEffect(() => {
    if (activeTab === 'overall') {
      const t = setTimeout(() => setIsScanning(true), 120)
      return () => clearTimeout(t)
    } else {
      setIsScanning(false)
    }
  }, [activeTab])

  // Automatically turn off scanner after wave completes to release GPU
  useEffect(() => {
    if (!isScanning) return
    const timer = setTimeout(() => setIsScanning(false), 1600)
    return () => clearTimeout(timer)
  }, [isScanning])

  const triggerScan = () => {
    setIsScanning(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsScanning(true)
      })
    })
  }

  // Find active week index matching today (if current month), else default to week 0
  const initialWeekIdx = useMemo(() => {
    if (!isCurrentMonth) return 0
    const idx = weeks.findIndex((w) => today.d >= w.start && today.d <= w.end)
    return idx >= 0 ? idx : 0
  }, [weeks, today.d, isCurrentMonth])

  const [weekIdx, setWeekIdx] = useState(initialWeekIdx)
  const currentWeek = weeks[weekIdx] ?? weeks[0]

  // Days in current week
  const weekDays = useMemo(() => {
    if (!currentWeek) return []
    const list: number[] = []
    for (let d = currentWeek.start; d <= currentWeek.end; d++) {
      list.push(d)
    }
    return list
  }, [currentWeek])

  const hijri = useMemo(() => getHijriDate(new Date(year, month, today.d)), [year, month, today.d])
  const currentPct = habitCount > 0 ? Math.round((todayDone / habitCount) * 100) : 0
  const strokeDashoffset = 125.6 - (125.6 * (habitCount > 0 ? todayDone / habitCount : 0))

  // 3-Month (13 Weeks = 91 Days) Quarterly Heatmap data
  const quarterlyData = useMemo(() => {
    const refDate = isCurrentMonth
      ? new Date(today.y, today.m, today.d)
      : new Date(year, month, dim)

    const dayOfWeek = refDate.getDay() // 0 = Sun, 6 = Sat
    const endSaturday = new Date(
      refDate.getFullYear(),
      refDate.getMonth(),
      refDate.getDate() + (6 - dayOfWeek)
    )

    const days: {
      date: Date
      key: string
      dayOfMonth: number
      monthIndex: number
      isToday: boolean
      isFuture: boolean
      globalColIndex: number
    }[] = []

    interface MonthGroup {
      monthIndex: number
      name: string
      isCurrent: boolean
      weekCount: number
      days: typeof days
    }

    const monthGroups: MonthGroup[] = []
    let currentGroup: MonthGroup | null = null

    for (let w = 0; w < 13; w++) {
      const weekStartDate = new Date(
        endSaturday.getFullYear(),
        endSaturday.getMonth(),
        endSaturday.getDate() - (12 - w) * 7 - 6
      )
      const m = weekStartDate.getMonth()
      if (!currentGroup || currentGroup.monthIndex !== m) {
        currentGroup = {
          monthIndex: m,
          name: MONTHS[m].slice(0, 3), // Clean 3-letter month name (no week count)
          isCurrent: m === month,
          weekCount: 1,
          days: [],
        }
        monthGroups.push(currentGroup)
      } else {
        currentGroup.weekCount++
      }

      for (let d = 0; d < 7; d++) {
        const dt = new Date(
          weekStartDate.getFullYear(),
          weekStartDate.getMonth(),
          weekStartDate.getDate() + d
        )
        const y = dt.getFullYear()
        const mo = dt.getMonth()
        const da = dt.getDate()
        const k = dateKey(y, mo, da)
        const dayObj = {
          date: dt,
          key: k,
          dayOfMonth: da,
          monthIndex: mo,
          isToday: k === today.key,
          isFuture: k > today.key,
          globalColIndex: w,
        }
        days.push(dayObj)
        currentGroup.days.push(dayObj)
      }
    }

    const startM = days[0].monthIndex
    const startY = days[0].date.getFullYear()
    const endM = days[days.length - 1].monthIndex
    const endY = days[days.length - 1].date.getFullYear()

    const rangeLabel =
      startY === endY
        ? `${MONTHS[startM].slice(0, 3)} – ${MONTHS[endM].slice(0, 3)} ${endY}`
        : `${MONTHS[startM].slice(0, 3)} ${startY} – ${MONTHS[endM].slice(0, 3)} ${endY}`

    const pastDaysCount = days.filter((d) => !d.isFuture).length

    return { days, monthGroups, rangeLabel, pastDaysCount }
  }, [year, month, dim, today.y, today.m, today.d, today.key, isCurrentMonth])

  return (
    <div className="space-y-4">
      {/* 1. Mini Hero / Today Status Card */}
      <div
        className="relative overflow-hidden rounded-3xl p-4.5 shadow-md border transition-all"
        style={{
          background: noor
            ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.45) 0%, rgba(15, 23, 42, 0.85) 100%)'
            : garden
            ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(16, 185, 129, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
          borderColor: noor
            ? 'rgba(234, 179, 8, 0.3)'
            : garden
            ? 'rgba(16, 185, 129, 0.3)'
            : 'rgba(59, 130, 246, 0.25)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider">
              {noor ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <span>🌙</span> {hijri.monthYear}
                </span>
              ) : garden ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span>🌸</span> Living Garden
                </span>
              ) : (
                <span className="text-blue-400 flex items-center gap-1">
                  <CalendarCheck size={13} /> Today&apos;s Focus
                </span>
              )}
            </div>

            <div className="mt-1 font-display text-2xl font-black text-ink leading-tight">
              <span>{todayDone}</span>
              <span className="text-base text-ink-3 font-bold"> / {habitCount} Done</span>
            </div>

            <div className="mt-1 text-[12px] font-semibold text-ink-3">
              {todayDone === habitCount && habitCount > 0
                ? '✨ All habits finished today!'
                : `${habitCount - todayDone} left to complete today`}
            </div>
          </div>

          {/* Right Hero Graphic */}
          <div className="relative flex size-14 shrink-0 items-center justify-center">
            {garden ? (
              <div className="scale-90 pb-1">
                <Plant stage={plantStage(todayDone, habitCount)} size={56} sway soil />
              </div>
            ) : noor ? (
              <div className="scale-90">
                <NoorLantern stage={plantStage(todayDone, habitCount)} size={48} />
              </div>
            ) : (
              <div className="relative grid size-13 place-items-center">
                <svg className="size-13 -rotate-90">
                  <circle
                    cx="26"
                    cy="26"
                    r="20"
                    stroke="rgba(255, 255, 255, 0.12)"
                    strokeWidth="4.5"
                    fill="transparent"
                  />
                  <circle
                    cx="26"
                    cy="26"
                    r="20"
                    stroke="var(--accent)"
                    strokeWidth="4.5"
                    fill="transparent"
                    strokeDasharray="125.6"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute num text-[11.5px] font-black text-ink">{currentPct}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Mobile View Switcher Tabs (Weekly | Today | Overall) - Clean Full Width */}
      <div className="rounded-2xl bg-surface p-1.5 border border-line shadow-xs">
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`rounded-xl py-2 text-center text-[12.5px] font-extrabold transition-all ${
              activeTab === 'weekly'
                ? 'bg-accent text-on-accent shadow-xs scale-[1.01]'
                : 'text-ink-3 hover:text-ink'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`rounded-xl py-2 text-center text-[12.5px] font-extrabold transition-all ${
              activeTab === 'today'
                ? 'bg-accent text-on-accent shadow-xs scale-[1.01]'
                : 'text-ink-3 hover:text-ink'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab('overall')}
            className={`rounded-xl py-2 text-center text-[12.5px] font-extrabold transition-all ${
              activeTab === 'overall'
                ? 'bg-accent text-on-accent shadow-xs scale-[1.01]'
                : 'text-ink-3 hover:text-ink'
            }`}
          >
            Overall
          </button>
        </div>
      </div>

      {/* 3. Week Selector Bar (Visible when in Weekly view) */}
      {activeTab === 'weekly' && currentWeek && (
        <div className="flex items-center justify-between rounded-2xl bg-surface-2/70 px-4 py-2 border border-line/60 text-xs">
          <button
            disabled={weekIdx <= 0}
            onClick={() => setWeekIdx((i) => Math.max(0, i - 1))}
            className="icon-btn !size-7 disabled:opacity-30"
            aria-label="Previous week"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-ink">Week {currentWeek.index + 1}</span>
            <span className="text-[11px] text-ink-3 font-medium">
              ({MONTHS[month].slice(0, 3)} {currentWeek.start} – {currentWeek.end})
            </span>
          </div>

          <button
            disabled={weekIdx >= weeks.length - 1}
            onClick={() => setWeekIdx((i) => Math.min(weeks.length - 1, i + 1))}
            className="icon-btn !size-7 disabled:opacity-30"
            aria-label="Next week"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* 3b. Range Selector Bar (Visible when in Overall view) */}
      {activeTab === 'overall' && (
        <div className="flex items-center justify-between rounded-2xl bg-surface-2/70 px-4 py-2 border border-line/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-ink">{quarterlyData.rangeLabel}</span>
            <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10.5px] font-bold text-emerald-400">
              13 Weeks
            </span>
          </div>
          <button
            onClick={triggerScan}
            className="flex items-center gap-1 rounded-lg bg-surface px-2.5 py-1 text-[11px] font-extrabold text-accent border border-line/80 hover:border-accent active:scale-95 transition-all shadow-2xs"
            title="Scan Left-to-Right wave"
          >
            <span>⚡</span>
            <span>Scan Wave</span>
          </button>
        </div>
      )}

      {/* 4. Habit Cards List */}
      {habitCount === 0 ? (
        <div className="card p-8 text-center space-y-2">
          <div className="text-3xl">🌱</div>
          <div className="font-display font-bold text-lg text-ink">No habits yet</div>
          <p className="text-xs text-ink-3">Add your first habit to start tracking on mobile.</p>
          <button className="btn btn-primary mt-2" onClick={onAdd}>
            <Plus size={15} /> Add Habit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {perHabit.map(({ habit, streak }, habitIndex) => {
            const habitColor = PALETTE[habitIndex % PALETTE.length]
            const isTodayChecked = !!state.checks[ck(habit.id, today.key)]

            return (
              <div
                key={habit.id}
                className="group relative overflow-hidden rounded-[22px] p-3.5 shadow-sm border transition-all"
                style={{
                  background: `color-mix(in srgb, ${habitColor} 8%, var(--surface))`,
                  borderColor: `color-mix(in srgb, ${habitColor} 24%, var(--line))`,
                }}
              >
                {/* Habit Header */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                    onClick={() => onEdit(habit)}
                  >
                    <span
                      className="grid size-8.5 shrink-0 place-items-center rounded-xl text-base shadow-2xs select-none"
                      style={{
                        background: `color-mix(in srgb, ${habitColor} 22%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${habitColor} 38%, transparent)`,
                      }}
                    >
                      {habit.emoji}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-bold text-ink leading-snug">
                        {habit.name}
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px] font-semibold text-ink-3">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Flame size={12} /> {streak} Days
                        </span>
                        {garden && (
                          <span className="text-emerald-500 font-bold">
                            🌱 Stage {plantStage(streak, 21)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Header Action depending on tab */}
                  {activeTab === 'overall' ? (
                    <button
                      onClick={(e) => onToggle(habit.id, today.key, e.currentTarget)}
                      className={`grid size-7.5 shrink-0 place-items-center rounded-full text-xs font-black shadow-xs transition-transform active:scale-90 ${
                        isTodayChecked
                          ? 'bg-emerald-500 text-black shadow-sm'
                          : 'border border-line bg-surface-2 text-ink-3 hover:border-ink-3'
                      }`}
                      title={isTodayChecked ? 'Done today' : 'Tap to mark done today'}
                    >
                      {isTodayChecked ? '✓' : ''}
                    </button>
                  ) : activeTab === 'today' ? (
                    <button
                      onClick={(e) => onToggle(habit.id, today.key, e.currentTarget)}
                      className={`grid size-8 shrink-0 place-items-center rounded-xl text-sm font-black transition-all active:scale-90 ${
                        isTodayChecked
                          ? 'bg-emerald-500 text-black shadow-md'
                          : 'border-2 border-line bg-surface-2 text-ink-3'
                      }`}
                    >
                      {isTodayChecked ? '✓' : ''}
                    </button>
                  ) : (
                    <button
                      onClick={() => onEdit(habit)}
                      className="icon-btn !size-7 text-ink-3 hover:text-ink shrink-0"
                      aria-label="Edit habit"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                </div>

                {/* TAB 1: WEEKLY (7-Day Circular Bubbles) */}
                {activeTab === 'weekly' && (
                  <div className="pt-2 border-t border-line/50">
                    <div className="grid grid-cols-7 gap-1">
                      {weekDays.map((d) => {
                        const date = dateKey(year, month, d)
                        const isDayChecked = !!state.checks[ck(habit.id, date)]
                        const isDayToday = date === today.key
                        const dayOfWeek = new Date(year, month, d).getDay()
                        const dayName = WEEKDAY_LETTERS[dayOfWeek]

                        return (
                          <div key={d} className="flex flex-col items-center gap-1">
                            <span
                              className={`text-[10px] font-bold ${
                                isDayToday ? 'text-accent font-extrabold' : 'text-ink-3'
                              }`}
                            >
                              {dayName}
                            </span>
                            <button
                              onClick={(e) => onToggle(habit.id, date, e.currentTarget)}
                              className={`relative grid size-8 place-items-center rounded-full text-xs font-black transition-all active:scale-90 ${
                                isDayChecked
                                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-black shadow-xs font-extrabold'
                                  : isDayToday
                                  ? 'border-2 border-accent bg-accent/15 text-accent font-bold'
                                  : 'border border-line/80 bg-surface-2/80 text-ink-3 hover:border-ink-3'
                              }`}
                              title={`${MONTHS[month]} ${d}`}
                            >
                              {isDayChecked ? '✓' : <span className="text-[10px] opacity-75">{d}</span>}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: TODAY CHECKLIST */}
                {activeTab === 'today' && (
                  <div className="pt-2 border-t border-line/50 flex items-center justify-between text-xs font-semibold">
                    <span className="text-ink-3">
                      Today: {WEEKDAY_SHORT[new Date(year, month, today.d).getDay()]}, {MONTHS[month]} {today.d}
                    </span>
                    <span className={isTodayChecked ? 'text-emerald-500 font-bold' : 'text-amber-500'}>
                      {isTodayChecked ? 'Completed ✨' : 'Tap checkmark to finish'}
                    </span>
                  </div>
                )}

                {/* TAB 3: OVERALL (3-Month 13-Week Squircle Heatmap) */}
                {activeTab === 'overall' && (() => {
                  let doneCount = 0
                  for (let i = 0; i < quarterlyData.days.length; i++) {
                    const d = quarterlyData.days[i]
                    if (!d.isFuture && state.checks[ck(habit.id, d.key)]) doneCount++
                  }
                  const pastDays = quarterlyData.pastDaysCount
                  const pct = pastDays > 0 ? Math.round((doneCount / pastDays) * 100) : 0

                  return (
                    <div className="pt-2.5 border-t border-line/50">
                      <div className="flex items-center justify-between text-[10.5px] font-semibold text-ink-3 mb-1.5">
                        <span>3-Month Consistency (13 Weeks)</span>
                        <span className="text-emerald-500 font-bold">
                          {doneCount} / {pastDays} days ({pct}%)
                        </span>
                      </div>

                      {/* Month Labels cleanly centered over their exact columns (without "4 weeks") */}
                      <div className="flex text-[9.5px] font-bold text-ink-3/80 mb-1 pl-5.5 pr-1 items-center">
                        {quarterlyData.monthGroups.map((mg) => (
                          <div
                            key={mg.monthIndex}
                            style={{ flex: mg.weekCount }}
                            className={`text-center truncate px-0.5 ${
                              mg.isCurrent ? 'text-accent font-extrabold' : ''
                            }`}
                          >
                            {mg.name}
                          </div>
                        ))}
                      </div>

                      {/* Heatmap Container */}
                      <div className="flex items-center gap-1.5 rounded-xl bg-surface-2/70 p-2 border border-line/50 overflow-x-auto justify-center">
                        {/* Weekday indicator on left: S M T W T F S */}
                        <div className="flex flex-col justify-between text-[8px] font-bold text-ink-3/70 h-[108px] pr-0.5 select-none">
                          {WEEKDAY_LETTERS.map((w, idx) => (
                            <span key={idx}>{w}</span>
                          ))}
                        </div>

                        {/* 13 columns grouped by month with sleek vertical divider lines (no key remount churn) */}
                        <div className="flex items-center gap-1.5">
                          {quarterlyData.monthGroups.map((mg, groupIdx) => (
                            <div key={mg.monthIndex} className="flex items-center gap-1.5">
                              {/* Sleek Vertical Divider Line between months */}
                              {groupIdx > 0 && (
                                <div
                                  className={`w-[1px] h-[106px] rounded-full my-auto transition-colors ${
                                    mg.isCurrent
                                      ? 'bg-accent/60 shadow-[0_0_6px_var(--accent)]'
                                      : 'bg-line/80'
                                  }`}
                                />
                              )}

                              {/* Month columns grid */}
                              <div
                                className="grid grid-flow-col grid-rows-7 gap-1"
                                style={{
                                  gridTemplateColumns: `repeat(${mg.weekCount}, minmax(0, 1fr))`,
                                }}
                              >
                                {mg.days.map((d) => {
                                  const on = !d.isFuture && !!state.checks[ck(habit.id, d.key)]

                                  return (
                                    <button
                                      key={d.key}
                                      type="button"
                                      disabled={d.isFuture}
                                      onClick={(e) => onToggle(habit.id, d.key, e.currentTarget)}
                                      className={`size-3.5 sm:size-4 rounded-[3.5px] transition-transform active:scale-90 hover:scale-125 ${
                                        d.isToday
                                          ? 'ring-2 ring-accent ring-offset-1 ring-offset-surface'
                                          : ''
                                      } ${d.isFuture ? 'opacity-15 cursor-not-allowed' : 'cursor-pointer'} ${
                                        on ? '' : 'bg-line/75'
                                      } ${
                                        isScanning
                                          ? on
                                            ? 'wave-flash-done'
                                            : !d.isFuture
                                            ? 'wave-flash-missed'
                                            : ''
                                          : ''
                                      }`}
                                      style={{
                                        color: habitColor,
                                        background: on ? habitColor : undefined,
                                        boxShadow: on ? `0 0 6px ${habitColor}80` : undefined,
                                        opacity: d.isFuture ? 0.15 : on ? 0.95 : 0.45,
                                        animationDelay: isScanning
                                          ? `${d.globalColIndex * 65}ms`
                                          : undefined,
                                      }}
                                      title={`${MONTHS[d.monthIndex]} ${d.dayOfMonth}: ${
                                        d.isFuture ? 'Upcoming' : on ? 'Done' : 'Not done'
                                      }`}
                                    />
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )
          })}
        </div>
      )}

      {onSwitchToDesktop && (
        <div className="pt-2 text-center">
          <button
            onClick={onSwitchToDesktop}
            className="btn !h-8 !px-3 !text-[11.5px] text-ink-3 hover:text-ink"
          >
            🖥️ View 31-Day Desktop Grid
          </button>
        </div>
      )}
    </div>
  )
}
