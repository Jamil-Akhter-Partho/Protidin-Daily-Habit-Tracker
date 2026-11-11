import { dateKey, daysInMonth, shiftKey, weeksOf, type Today, type Week } from './date'
import { ck, type Habit, type State } from './store'

export function goalFor(h: Habit, dim: number): number {
  return h.goal == null ? dim : Math.min(Math.max(1, h.goal), dim)
}

export function doneInRange(
  checks: State['checks'],
  id: string,
  y: number,
  m: number,
  start: number,
  end: number,
): number {
  let n = 0
  for (let d = start; d <= end; d++) if (checks[ck(id, dateKey(y, m, d))]) n++
  return n
}

/** Consecutive days ending today, or yesterday when today is not ticked yet. */
export function currentStreak(checks: State['checks'], id: string, todayKey: string): number {
  let key = checks[ck(id, todayKey)] ? todayKey : shiftKey(todayKey, -1)
  let n = 0
  while (checks[ck(id, key)]) {
    n++
    key = shiftKey(key, -1)
  }
  return n
}

export interface MonthStats {
  dim: number
  weeks: Week[]
  /** Last day of the viewed month that is not in the future (0 if the month is all future). */
  elapsed: number
  /** Per day (index = day - 1): habits completed */
  perDay: number[]
  perHabit: { habit: Habit; done: number; goal: number; pct: number; streak: number }[]
  perWeek: { week: Week; done: number; possible: number; pct: number }[]
  /** Share of all monthly goals met, 0..1 */
  monthPct: number
  monthDone: number
  monthGoal: number
  perfectDays: number
  /** Index 0 = Sunday. Average completion on that weekday across elapsed days, or null. */
  perWeekday: (number | null)[]
}

export function monthStats(state: State, y: number, m: number, today: Today): MonthStats {
  const { habits, checks } = state
  const dim = daysInMonth(y, m)
  const weeks = weeksOf(dim)

  const viewed = y * 12 + m
  const current = today.y * 12 + today.m
  const elapsed = viewed < current ? dim : viewed > current ? 0 : today.d

  const perDay: number[] = []
  for (let d = 1; d <= dim; d++) {
    const key = dateKey(y, m, d)
    let n = 0
    for (const h of habits) if (checks[ck(h.id, key)]) n++
    perDay.push(n)
  }

  const perHabit = habits.map((habit) => {
    const done = doneInRange(checks, habit.id, y, m, 1, dim)
    const goal = goalFor(habit, dim)
    return {
      habit,
      done,
      goal,
      pct: Math.min(1, done / goal),
      streak: currentStreak(checks, habit.id, today.key),
    }
  })

  const perWeek = weeks.map((week) => {
    let done = 0
    for (let d = week.start; d <= week.end; d++) done += perDay[d - 1]
    const possible = habits.length * (week.end - week.start + 1)
    return { week, done, possible, pct: possible ? done / possible : 0 }
  })

  const monthGoal = perHabit.reduce((s, h) => s + h.goal, 0)
  const monthDone = perHabit.reduce((s, h) => s + Math.min(h.done, h.goal), 0)

  let perfectDays = 0
  if (habits.length) {
    for (let d = 1; d <= elapsed; d++) if (perDay[d - 1] === habits.length) perfectDays++
  }

  const sums = Array<number>(7).fill(0)
  const counts = Array<number>(7).fill(0)
  if (habits.length) {
    for (let d = 1; d <= elapsed; d++) {
      const wd = new Date(y, m, d).getDay()
      sums[wd] += perDay[d - 1] / habits.length
      counts[wd]++
    }
  }
  const perWeekday = sums.map((s, i) => (counts[i] ? s / counts[i] : null))

  return {
    dim,
    weeks,
    elapsed,
    perDay,
    perHabit,
    perWeek,
    monthPct: monthGoal ? monthDone / monthGoal : 0,
    monthDone,
    monthGoal,
    perfectDays,
    perWeekday,
  }
}
