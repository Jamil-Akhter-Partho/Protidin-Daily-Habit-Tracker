import type { ReactNode } from 'react'
import { CalendarCheck, Flame, Sparkles, Target } from 'lucide-react'
import { useCountUp } from '../lib/hooks'
import type { MonthStats } from '../lib/stats'
import { Donut } from './Charts'

function Card({
  i,
  wk,
  icon,
  label,
  children,
  aside,
}: {
  i: number
  wk: number
  icon: ReactNode
  label: string
  children: ReactNode
  aside?: ReactNode
}) {
  return (
    <div className={`stat-card rise wk-${wk} flex items-center gap-4 p-5`} style={{ ['--i' as string]: i }}>
      <div className="min-w-0 flex-1 relative z-1">
        <div className="mb-2 flex items-center gap-2 text-[12.5px] font-semibold text-ink-2">
          <span className="grid size-7 place-items-center rounded-lg bg-(--wk) text-white shadow-xs">
            {icon}
          </span>
          <span className="font-bold tracking-tight">{label}</span>
        </div>
        {children}
      </div>
      {aside && <div className="relative z-1 shrink-0">{aside}</div>}
    </div>
  )
}

const Big = ({ children }: { children: ReactNode }) => (
  <div className="num font-display text-[34px] font-extrabold leading-none tracking-tight text-ink">{children}</div>
)
const Sub = ({ children }: { children: ReactNode }) => (
  <div className="mt-1.5 truncate text-[12.5px] font-medium text-ink-3">{children}</div>
)

export function StatCards({
  stats,
  todayDone,
  habitCount,
}: {
  stats: MonthStats
  todayDone: number
  habitCount: number
}) {
  const top = stats.perHabit.reduce<MonthStats['perHabit'][number] | null>(
    (best, h) => (h.streak > (best?.streak ?? 0) ? h : best),
    null,
  )
  const todayN = useCountUp(todayDone)
  const monthN = useCountUp(Math.round(stats.monthPct * 100))
  const streakN = useCountUp(top?.streak ?? 0)
  const perfectN = useCountUp(stats.perfectDays)
  const left = habitCount - todayDone

  return (
    <section className="grid grid-cols-2 gap-4 xl:grid-cols-4" aria-label="Summary">
      <Card
        i={1}
        wk={2}
        icon={<CalendarCheck size={15} />}
        label="Today"
        aside={
          <Donut
            value={habitCount ? todayDone / habitCount : 0}
            size={64}
            stroke={8}
            color="var(--w2)"
            track="color-mix(in srgb, var(--w2) 20%, transparent)"
          />
        }
      >
        <Big>
          {todayN}
          <span className="text-[20px] text-ink-3"> / {habitCount}</span>
        </Big>
        <Sub>{!habitCount ? 'No habits yet' : left === 0 ? 'All done. Great day!' : `${left} left to finish`}</Sub>
      </Card>

      <Card i={2} wk={4} icon={<Target size={15} />} label="Monthly goals">
        <Big>
          {monthN}
          <span className="text-[20px] text-ink-3">%</span>
        </Big>
        <div className="bar-track mt-2.5 bg-(--wk-line)/40">
          <div className="bar-fill shadow-xs" style={{ width: `${stats.monthPct * 100}%`, background: 'var(--w4)' }} />
        </div>
        <Sub>
          {stats.monthDone} of {stats.monthGoal} target days
        </Sub>
      </Card>

      <Card i={3} wk={1} icon={<Flame size={15} />} label="Best active streak">
        <Big>
          {streakN}
          <span className="text-[20px] text-ink-3"> {top?.streak === 1 ? 'day' : 'days'}</span>
        </Big>
        <Sub>{top ? `${top.habit.emoji} ${top.habit.name}` : 'Tick a habit to start one'}</Sub>
      </Card>

      <Card i={4} wk={5} icon={<Sparkles size={15} />} label="Perfect days">
        <Big>{perfectN}</Big>
        <Sub>Days with every habit done</Sub>
      </Card>
    </section>
  )
}
