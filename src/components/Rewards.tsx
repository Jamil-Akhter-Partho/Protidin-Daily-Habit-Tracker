import type { CSSProperties } from 'react'
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

function LevelWreath({ level, progress }: { level: number; progress: number }) {
  const petals = 12
  const lit = progress <= 0 ? 0 : Math.max(1, Math.round(progress * petals))

  return (
    <div className="relative size-[108px] shrink-0">
      <svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
        <g className="rw-wreath-spin" style={{ transformOrigin: '50px 50px' }}>
          {Array.from({ length: petals }, (_, i) => {
            const on = i < lit
            const angle = (i * 360) / petals
            const fill = on ? (i % 2 ? 'var(--gold)' : 'var(--petal-1)') : 'rgb(255 255 255 / 0.16)'
            return (
              <path
                key={i}
                d="M0,-28 C5.5,-32 6,-42 0,-45 C-6,-42 -5.5,-32 0,-28 Z"
                fill={fill}
                transform={`translate(50 50) rotate(${angle})`}
                style={{ transition: 'fill 0.4s ease' }}
              />
            )
          })}
        </g>
        <circle cx="50" cy="50" r="25" fill="var(--panel)" stroke="var(--gold)" strokeWidth="1.8" strokeOpacity="0.8" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center leading-none">
          <div className="text-[9.5px] font-bold uppercase tracking-widest opacity-70">Level</div>
          <div className="num font-display text-[30px] font-extrabold">{level}</div>
        </div>
      </div>
    </div>
  )
}

function StatFlora({ kind }: { kind: 'ticks' | 'streak' | 'perfect' }) {
  if (kind === 'ticks') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0" aria-hidden="true">
        <g className="rw-stat-sway" style={{ transformOrigin: '8px 14px' }}>
          <path d="M8 14 V6" stroke="var(--leaf)" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 10 C4 10 3 6.5 5 4.5 C7 4.5 8 7 8 10 Z" fill="var(--leaf)" />
          <path d="M8 8.5 C12 8.5 13 5 11 3 C9 3 8 5.5 8 8.5 Z" fill="var(--leaf)" opacity="0.85" />
        </g>
      </svg>
    )
  }
  const petalFill = kind === 'streak' ? 'var(--gold)' : 'var(--petal-1)'
  const coreFill = kind === 'streak' ? '#ffffff' : 'var(--gold)'
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0" aria-hidden="true">
      <g className="rw-stat-breathe" style={{ transformOrigin: '8px 8px' }}>
        <circle cx="8" cy="3.8" r="2.2" fill={petalFill} />
        <circle cx="12" cy="6.7" r="2.2" fill={petalFill} />
        <circle cx="10.5" cy="11.3" r="2.2" fill={petalFill} />
        <circle cx="5.5" cy="11.3" r="2.2" fill={petalFill} />
        <circle cx="4" cy="6.7" r="2.2" fill={petalFill} />
        <circle cx="8" cy="8" r="2.1" fill={coreFill} />
      </g>
    </svg>
  )
}

function BadgeBloom({ unlocked, xp, index, Icon }: { unlocked: boolean; xp: number; index: number; Icon: LucideIcon }) {
  if (!unlocked) {
    return (
      <div className="relative grid size-12 shrink-0 place-items-center">
        <svg viewBox="0 0 48 48" className="size-full" aria-hidden="true">
          <circle cx="24" cy="24" r="21" fill="var(--surface)" stroke="var(--line)" strokeWidth="1" />
          <g className="rw-bud-hover" style={{ transformOrigin: '24px 36px' }}>
            <g className="rw-bud-sway" style={{ transformOrigin: '24px 37px', ['--i' as string]: index } as CSSProperties}>
              <path d="M24 37 V24" stroke="var(--leaf-2)" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
              <path d="M24 33 C18 33 16 29 18 26 C21 26 24 29 24 33 Z" fill="var(--leaf)" opacity="0.72" />
              <path d="M24 31 C30 31 32 27 30 24 C27 24 24 27 24 31 Z" fill="var(--leaf)" opacity="0.65" />
              <path d="M24 25 C19 23 19 14 24 11 C29 14 29 23 24 25 Z" fill="var(--wk-line)" opacity="0.9" />
              <path d="M24 24 C21.5 22 21.5 16 24 13.5 C26.5 16 26.5 22 24 24 Z" fill="var(--petal-1)" opacity="0.72" />
            </g>
          </g>
        </svg>
        <span className="absolute bottom-0 right-0 grid size-4 place-items-center rounded-full border border-line bg-surface-2 text-ink-3">
          <Lock size={9} strokeWidth={2.4} />
        </span>
      </div>
    )
  }

  const petals = xp >= 300 ? 10 : xp >= 75 ? 8 : 6
  const prestige = xp >= 300

  return (
    <div className="rw-bloom-pop relative grid size-12 shrink-0 place-items-center">
      <svg viewBox="0 0 48 48" className="absolute inset-0 size-full" aria-hidden="true">
        <g className="rw-petal-hover" style={{ transformOrigin: '24px 24px' }}>
          <g className="rw-petal-breathe" style={{ transformOrigin: '24px 24px', ['--i' as string]: index } as CSSProperties}>
            {Array.from({ length: petals }, (_, i) => {
              const angle = (i * 360) / petals
              return (
                <path
                  key={i}
                  d="M0,-12 C4,-15 4.4,-21.5 0,-23 C-4.4,-21.5 -4,-15 0,-12 Z"
                  fill={i % 2 ? 'var(--wk-line)' : 'var(--wk)'}
                  fillOpacity={i % 2 ? 0.92 : 1}
                  transform={`translate(24 24) rotate(${angle})`}
                />
              )
            })}
          </g>
        </g>
        <circle cx="24" cy="24" r="12.5" fill="var(--wk)" stroke="var(--surface)" strokeWidth="1.6" />
        {prestige && <path className="twinkle" d="M40 7 l1 2.2 2.2 1 -2.2 1 -1 2.2 -1 -2.2 -2.2 -1 2.2 -1 Z" fill="var(--gold)" />}
      </svg>
      <span className="relative grid size-6 place-items-center" style={{ color: 'var(--on-wk, #ffffff)' }}>
        <Icon size={15} strokeWidth={2.4} />
      </span>
    </div>
  )
}

export function RewardsPanel({ rewards, garden = false }: { rewards: Rewards; garden?: boolean }) {
  const xp = useCountUp(rewards.xp)
  const toNext = rewards.levelSize - rewards.intoLevel
  const facts: { key: 'ticks' | 'streak' | 'perfect'; label: string; value: number }[] = [
    { key: 'ticks', label: 'Habits ticked', value: rewards.totalChecks },
    { key: 'streak', label: 'Longest streak', value: rewards.longestStreak },
    { key: 'perfect', label: 'Perfect days', value: rewards.perfectDays },
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
            {garden ? (
              <LevelWreath level={rewards.level} progress={rewards.intoLevel / rewards.levelSize} />
            ) : (
              <Donut value={rewards.intoLevel / rewards.levelSize} size={104} stroke={10} color="var(--gold)" track="rgb(255 255 255 / 0.14)">
                <div className="text-center leading-none">
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Level</div>
                  <div className="num font-display text-[34px] font-extrabold">{rewards.level}</div>
                </div>
              </Donut>
            )}
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
                <div className="flex items-center justify-center gap-1">
                  {garden && <StatFlora kind={f.key} />}
                  <div className="num font-display text-[20px] font-extrabold leading-none">{f.value}</div>
                </div>
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
                  on ? 'is-unlocked border-(--wk-line) bg-(--wk-soft)' : 'border-line bg-surface-2 hover:border-(--wk-line)'
                }`}
                style={{ ['--i' as string]: i }}
              >
                {garden ? (
                  <BadgeBloom unlocked={on} xp={b.xp} index={i} Icon={Icon} />
                ) : (
                  <div
                    className={`badge-icon grid size-11 shrink-0 place-items-center rounded-xl ${
                      on ? 'bg-(--wk) text-white' : 'bg-surface text-ink-3'
                    }`}
                  >
                    {on ? <Icon size={21} /> : <Lock size={17} />}
                  </div>
                )}
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
