export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
export const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const pad = (n: number) => String(n).padStart(2, '0')

/** Local-time date key, e.g. 2026-11-05. `m` is 0-based. */
export const dateKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

export const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()

export interface Today {
  y: number
  m: number
  d: number
  key: string
}

export function todayParts(): Today {
  const n = new Date()
  const y = n.getFullYear()
  const m = n.getMonth()
  const d = n.getDate()
  return { y, m, d, key: dateKey(y, m, d) }
}

export interface Week {
  /** 0-based week index within the month */
  index: number
  start: number
  end: number
}

/** Weeks are fixed 7-day blocks from the 1st: 1–7, 8–14, … */
export function weeksOf(dim: number): Week[] {
  const out: Week[] = []
  for (let start = 1, index = 0; start <= dim; start += 7, index++) {
    out.push({ index, start, end: Math.min(start + 6, dim) })
  }
  return out
}

/** Whole-day number for a date key, for day-difference maths. */
export function dayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000)
}

export function shiftKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d + days)
  return dateKey(dt.getFullYear(), dt.getMonth(), dt.getDate())
}
