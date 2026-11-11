import {
  Award, Crown, Flame, Footprints, Gem, Lock, Medal, Rocket, Shield, Sparkles, Star, Target, Trophy, Zap,
  type LucideIcon,
} from 'lucide-react'
import { useCountUp } from '../lib/hooks'
import { BADGES, type Rewards } from '../lib/rewards'
import { Donut } from './Charts'

export const BADGE_ICONS: Record<string, LucideIcon> = {
  'first-step': Footprints,
  'streak-3': Flame,
  'perfect-day': Star,
  'streak-7': Zap,
  'checks-50': Rocket,
  'goal-hit': Target,
  'perfect-week': Sparkles,
  'streak-21': Shield,
  'checks-250': Medal,
  'clean-sweep': Trophy,
  'streak-50': Gem,
  'checks-1000': Crown,
}

export function LevelChip({ rewards }: { rewards: Rewards }) {
  return (
    <a
      href="#rewards"
      className="flex h-[38px] items-center gap-2.5 rounded-xl border border-line bg-surface pl-1.5 pr-3 no-underline transition hover:border-ink-3"
      title={`${rewards.xp} XP in total`}
    >
      <span className="num grid size-7 place-items-center rounded-lg bg-accent text-[12.5px] font-extrabold text-on-accent">
        {rewards.level}
      </span>
      <span className="leading-none">
        <span className="block text-[12px] font-bold">{rewards.title}</span>
        <span className="mt-1 block h-1 w-[84px] overflow-hidden rounded-full bg-surface-2">
          <span className="xp-fill block h-full rounded-full" style={{ width: `${(rewards.intoLevel / rewards.levelSize) * 100}%` }} />
        </span>
      </span>
    </a>
  )
}

export function RewardsPanel({ rewards }: { rewards: Rewards }) {
  const xp = useCountUp(rewards.xp)
  const toNext = rewards.levelSize - rewards.intoLevel
  const facts = [
    { label: 'Habits ticked', value: rewards.totalChecks },
    { label: 'Longest streak', value: rewards.longestStreak },
    { label: 'Perfect days', value: rewards.perfectDays },
  ]

  return (
    <section id="rewards" className="card rise scroll-mt-6 p-5" style={{ ['--i' as string]: 9 }}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[17px] font-bold">Rewards</h2>
        <span className="num text-[12.5px] text-ink-3">
          {rewards.unlocked.size} of {BADGES.length} badges unlocked
        </span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <div className="flex flex-col rounded-2xl bg-panel p-5 text-white">
          <div className="flex items-center gap-4">
            <Donut value={rewards.intoLevel / rewards.levelSize} size={104} stroke={10} color="var(--gold)" track="rgb(255 255 255 / 0.14)">
              <div className="text-center leading-none">
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Level</div>
                <div className="num font-display text-[34px] font-extrabold">{rewards.level}</div>
              </div>
            </Donut>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-display text-[22px] font-extrabold">
                <Award size={20} className="text-gold" /> {rewards.title}
              </div>
              <div className="num mt-1 text-[13px] opacity-80">{xp.toLocaleString()} XP earned</div>
              <div className="num mt-0.5 text-[12.5px] opacity-60">
                {toNext} XP to level {rewards.level + 1}
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {facts.map((f) => (
              <div key={f.label} className="rounded-xl bg-white/10 px-2 py-2.5 text-center">
                <div className="num font-display text-[20px] font-extrabold leading-none">{f.value}</div>
                <div className="mt-1 text-[10.5px] opacity-70">{f.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px] opacity-60">Every tick earns 10 XP. Badges add bonus XP.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
          {BADGES.map((b, i) => {
            const on = rewards.unlocked.has(b.id)
            const Icon = BADGE_ICONS[b.id] ?? Award
            return (
              <div
                key={b.id}
                className={`badge-tile wk-${(i % 5) + 1} flex items-center gap-3 rounded-2xl border p-3 ${
                  on ? 'is-unlocked border-(--wk-line) bg-(--wk-soft)' : 'border-line bg-surface-2'
                }`}
                style={{ ['--i' as string]: i }}
              >
                <div
                  className={`badge-icon grid size-11 shrink-0 place-items-center rounded-xl ${
                    on ? 'bg-(--wk) text-white' : 'bg-surface text-ink-3'
                  }`}
                >
                  {on ? <Icon size={21} /> : <Lock size={17} />}
                </div>
                <div className="min-w-0">
                  <div className={`truncate text-[13px] font-bold ${on ? 'text-(--wk-deep)' : 'text-ink-2'}`}>{b.name}</div>
                  <div className={`truncate text-[11.5px] ${on ? 'text-(--wk-deep) opacity-75' : 'text-ink-3'}`} title={b.desc}>
                    {b.desc}
                  </div>
                  <div className={`num mt-0.5 text-[11px] font-bold ${on ? 'text-(--wk-deep)' : 'text-ink-3'}`}>+{b.xp} XP</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
