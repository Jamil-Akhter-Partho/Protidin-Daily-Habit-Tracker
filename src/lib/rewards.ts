import { dayNumber, daysInMonth } from './date'
import { goalFor } from './stats'
import type { State } from './store'

export const XP_PER_CHECK = 10

export interface Badge {
  id: string
  name: string
  desc: string
  xp: number
}

interface Facts {
  totalChecks: number
  longestStreak: number
  perfectDays: number
  longestPerfectRun: number
  goalsHit: number
  cleanSweep: boolean
}

const BADGE_RULES: (Badge & { test: (f: Facts) => boolean })[] = [
  { id: 'first-step', name: 'First Step', desc: 'Tick your first habit', xp: 20, test: (f) => f.totalChecks >= 1 },
  { id: 'streak-3', name: 'Warming Up', desc: '3-day streak on a habit', xp: 30, test: (f) => f.longestStreak >= 3 },
  { id: 'perfect-day', name: 'Perfect Day', desc: 'Finish every habit in one day', xp: 50, test: (f) => f.perfectDays >= 1 },
  { id: 'streak-7', name: 'One Week Strong', desc: '7-day streak on a habit', xp: 75, test: (f) => f.longestStreak >= 7 },
  { id: 'checks-50', name: 'Getting Serious', desc: '50 habits ticked', xp: 75, test: (f) => f.totalChecks >= 50 },
  { id: 'goal-hit', name: 'Goal Crusher', desc: 'Reach a monthly goal', xp: 100, test: (f) => f.goalsHit >= 1 },
  { id: 'perfect-week', name: 'Perfect Week', desc: '7 perfect days in a row', xp: 150, test: (f) => f.longestPerfectRun >= 7 },
  { id: 'streak-21', name: 'Habit Formed', desc: '21-day streak on a habit', xp: 200, test: (f) => f.longestStreak >= 21 },
  { id: 'checks-250', name: 'Momentum', desc: '250 habits ticked', xp: 200, test: (f) => f.totalChecks >= 250 },
  { id: 'clean-sweep', name: 'Clean Sweep', desc: 'Reach every goal in a month', xp: 300, test: (f) => f.cleanSweep },
  { id: 'streak-50', name: 'Iron Will', desc: '50-day streak on a habit', xp: 400, test: (f) => f.longestStreak >= 50 },
  { id: 'checks-1000', name: 'Thousand Club', desc: '1,000 habits ticked', xp: 500, test: (f) => f.totalChecks >= 1000 },
]

export const BADGES: Badge[] = BADGE_RULES.map(({ id, name, desc, xp }) => ({ id, name, desc, xp }))

const TITLES = [
  'Beginner', 'Starter', 'Builder', 'Consistent', 'Committed',
  'Dedicated', 'Disciplined', 'Unstoppable', 'Master', 'Legend',
]

export interface Rewards extends Facts {
  xp: number
  level: number
  title: string
  /** XP earned inside the current level */
  intoLevel: number
  /** XP the current level needs in total */
  levelSize: number
  unlocked: Set<string>
}

function longestRun(days: number[]): number {
  if (!days.length) return 0
  days.sort((a, b) => a - b)
  let best = 1
  let run = 1
  for (let i = 1; i < days.length; i++) {
    run = days[i] === days[i - 1] + 1 ? run + 1 : 1
    if (run > best) best = run
  }
  return best
}

/** Everything here is derived from the habit data, so rewards can never drift out of sync. */
export function computeRewards(state: State): Rewards {
  const { habits, checks } = state
  const byHabit = new Map<string, number[]>(habits.map((h) => [h.id, []]))
  const byDate = new Map<number, number>()
  const byHabitMonth = new Map<string, number>()
  let totalChecks = 0

  for (const key of Object.keys(checks)) {
    const sep = key.lastIndexOf('|')
    const id = key.slice(0, sep)
    const date = key.slice(sep + 1)
    const list = byHabit.get(id)
    if (!list) continue
    const day = dayNumber(date)
    list.push(day)
    byDate.set(day, (byDate.get(day) ?? 0) + 1)
    const hm = id + '|' + date.slice(0, 7)
    byHabitMonth.set(hm, (byHabitMonth.get(hm) ?? 0) + 1)
    totalChecks++
  }

  let longestStreak = 0
  for (const days of byHabit.values()) longestStreak = Math.max(longestStreak, longestRun(days))

  const perfect: number[] = []
  if (habits.length) {
    for (const [day, n] of byDate) if (n === habits.length) perfect.push(day)
  }

  let goalsHit = 0
  const hitsPerMonth = new Map<string, number>()
  for (const [hm, count] of byHabitMonth) {
    const sep = hm.lastIndexOf('|')
    const habit = habits.find((h) => h.id === hm.slice(0, sep))
    if (!habit) continue
    const month = hm.slice(sep + 1)
    const [y, m] = month.split('-').map(Number)
    if (count >= goalFor(habit, daysInMonth(y, m - 1))) {
      goalsHit++
      hitsPerMonth.set(month, (hitsPerMonth.get(month) ?? 0) + 1)
    }
  }
  let cleanSweep = false
  if (habits.length) {
    for (const n of hitsPerMonth.values()) if (n === habits.length) cleanSweep = true
  }

  const facts: Facts = {
    totalChecks,
    longestStreak,
    perfectDays: perfect.length,
    longestPerfectRun: longestRun(perfect),
    goalsHit,
    cleanSweep,
  }

  const unlocked = new Set<string>()
  let xp = totalChecks * XP_PER_CHECK
  for (const rule of BADGE_RULES) {
    if (rule.test(facts)) {
      unlocked.add(rule.id)
      xp += rule.xp
    }
  }

  let level = 1
  let levelSize = 100
  let intoLevel = xp
  while (intoLevel >= levelSize) {
    intoLevel -= levelSize
    level++
    levelSize += 50
  }

  return {
    ...facts,
    xp,
    level,
    title: TITLES[Math.min(level, TITLES.length) - 1],
    intoLevel,
    levelSize,
    unlocked,
  }
}
