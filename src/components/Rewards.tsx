import type { CSSProperties } from 'react'
import {
  Award, Crown, Flame, Footprints, Gem, Lock, Medal, Rocket, Shield, Sparkles, Star, Target, Trophy, Zap,
  type LucideIcon,
} from 'lucide-react'
import { useCountUp } from '../lib/hooks'
import { BADGES, type Rewards } from '../lib/rewards'
import { ChronometerDial } from './Charts'

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

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond'

export interface TierInfo {
  tier: BadgeTier
  label: string
  color: string
  softBg: string
  border: string
  glow: string
}

export function getBadgeTier(xp: number): TierInfo {
  if (xp >= 400) {
    return {
      tier: 'diamond',
      label: 'Obsidian',
      color: '#06b6d4',
      softBg: 'rgba(6, 182, 212, 0.14)',
      border: 'rgba(6, 182, 212, 0.45)',
      glow: 'rgba(6, 182, 212, 0.25)',
    }
  }
  if (xp >= 150) {
    return {
      tier: 'gold',
      label: 'Gold',
      color: '#eab308',
      softBg: 'rgba(234, 179, 8, 0.14)',
      border: 'rgba(234, 179, 8, 0.45)',
      glow: 'rgba(234, 179, 8, 0.25)',
    }
  }
  if (xp >= 75) {
    return {
      tier: 'silver',
      label: 'Silver',
      color: '#94a3b8',
      softBg: 'rgba(148, 163, 184, 0.14)',
      border: 'rgba(148, 163, 184, 0.35)',
      glow: 'rgba(148, 163, 184, 0.2)',
    }
  }
  return {
    tier: 'bronze',
    label: 'Bronze',
    color: '#d97706',
    softBg: 'rgba(217, 119, 6, 0.14)',
    border: 'rgba(217, 119, 6, 0.35)',
    glow: 'rgba(217, 119, 6, 0.2)',
  }
}

function getBadgeProgress(badgeId: string, rewards: Rewards): number {
  switch (badgeId) {
    case 'first-step':
      return Math.min(1, rewards.totalChecks / 1)
    case 'streak-3':
      return Math.min(1, rewards.longestStreak / 3)
    case 'perfect-day':
      return Math.min(1, rewards.perfectDays / 1)
    case 'streak-7':
      return Math.min(1, rewards.longestStreak / 7)
    case 'checks-50':
      return Math.min(1, rewards.totalChecks / 50)
    case 'goal-hit':
      return Math.min(1, rewards.goalsHit / 1)
    case 'perfect-week':
      return Math.min(1, rewards.longestPerfectRun / 7)
    case 'streak-21':
      return Math.min(1, rewards.longestStreak / 21)
    case 'checks-250':
      return Math.min(1, rewards.totalChecks / 250)
    case 'clean-sweep':
      return rewards.cleanSweep ? 1 : 0
    case 'streak-50':
      return Math.min(1, rewards.longestStreak / 50)
    case 'checks-1000':
      return Math.min(1, rewards.totalChecks / 1000)
    default:
      return 0
  }
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

function NoorRosette({ level }: { level: number; progress: number }) {
  return (
    <div className="relative size-[104px] shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="size-full overflow-visible" aria-hidden="true">
        {/* Ambient Noor Aura */}
        <circle cx="50" cy="50" r="46" fill="var(--accent)" fillOpacity="0.14" className="noor-moon-glow" />

        {/* 8-Point Rub el Hizb Star Frame */}
        <g className="noor-arch-pulse" style={{ transformOrigin: '50px 50px' }}>
          <rect
            x="16"
            y="16"
            width="68"
            height="68"
            rx="12"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1.8"
            strokeOpacity="0.9"
          />
          <rect
            x="16"
            y="16"
            width="68"
            height="68"
            rx="12"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1.8"
            strokeOpacity="0.9"
            transform="rotate(45 50 50)"
          />
        </g>

        {/* Center Sanctuary Dial */}
        <circle cx="50" cy="50" r="26" fill="var(--panel)" stroke="var(--accent)" strokeWidth="1.8" />
      </svg>
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="text-center leading-none">
          <div className="text-[9px] font-extrabold uppercase tracking-widest text-(--accent)">Tier</div>
          <div className="num font-display text-[26px] font-black text-ink">{level}</div>
        </div>
      </div>
    </div>
  )
}

function StatNoor({ kind }: { kind: 'ticks' | 'streak' | 'perfect' }) {
  if (kind === 'ticks') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0" aria-hidden="true">
        <path d="M 8,2 A 6,6 0 1 0 14,8 A 5,5 0 1 1 8,2 Z" fill="var(--accent)" />
      </svg>
    )
  }
  if (kind === 'streak') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0 text-(--gold)" aria-hidden="true">
        <path
          d="M 8,1 L 9.6,5.4 L 14.2,5.7 L 10.6,8.7 L 11.8,13.2 L 8,10.6 L 4.2,13.2 L 5.4,8.7 L 1.8,5.7 L 6.4,5.4 Z"
          fill="var(--gold)"
        />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0 text-(--accent)" aria-hidden="true">
      <circle cx="8" cy="8" r="6" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="3" fill="var(--gold)" />
    </svg>
  )
}

function BadgeNoor({
  unlocked,
  Icon,
}: {
  unlocked: boolean
  Icon: LucideIcon
}) {
  if (!unlocked) {
    return (
      <div className="relative grid size-12 shrink-0 place-items-center">
        <svg viewBox="0 0 48 48" className="size-full overflow-visible" aria-hidden="true">
          <path
            d="M 12,44 V 22 C 12,12 20,6 24,4 C 28,6 36,12 36,22 V 44 Z"
            fill="var(--surface-2)"
            stroke="var(--line)"
            strokeWidth="1.4"
            opacity="0.65"
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-ink-3">
          <Lock size={15} strokeWidth={2.2} />
        </span>
      </div>
    )
  }

  return (
    <div className="noor-moon-glow relative grid size-12 shrink-0 place-items-center">
      <svg viewBox="0 0 48 48" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
        <path
          d="M 10,44 V 22 C 10,11 19,5 24,3 C 29,5 38,11 38,22 V 44 Z"
          fill="var(--surface)"
          stroke="var(--accent)"
          strokeWidth="1.8"
        />
        <path
          d="M 13,44 V 23 C 13,13 20,8 24,6 C 28,8 35,13 35,23 V 44 Z"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="0.8"
          strokeDasharray="2.5 2"
          opacity="0.85"
        />
        <circle cx="24" cy="3" r="1.8" fill="var(--gold)" className="noor-star" />
      </svg>
      <span className="relative z-1 grid size-6 place-items-center" style={{ color: 'var(--accent)' }}>
        <Icon size={16} strokeWidth={2.4} />
      </span>
    </div>
  )
}

export function RewardsPanel({ rewards, garden = false, noor = false }: { rewards: Rewards; garden?: boolean; noor?: boolean }) {
  const xp = useCountUp(rewards.xp)
  const toNext = rewards.levelSize - rewards.intoLevel
  const facts: { key: 'ticks' | 'streak' | 'perfect'; label: string; value: number }[] = [
    { key: 'ticks', label: 'Habits ticked', value: rewards.totalChecks },
    { key: 'streak', label: 'Longest streak', value: rewards.longestStreak },
    { key: 'perfect', label: 'Perfect days', value: rewards.perfectDays },
  ]

  return (
    <section id="rewards" className="gazette-card rise scroll-mt-6 p-5" style={{ ['--i' as string]: 9 }}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[17px] font-bold text-ink">Rewards</h2>
            <span className="rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-ink-3">
              Prestige Vault
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-ink-3">Milestone achievements & royal honor medallions</p>
        </div>
        <span className="num text-[12px] font-bold text-ink-3">
          {rewards.unlocked.size} of {BADGES.length} badges unlocked
        </span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[320px_1fr] items-start">
        {/* Left: Royal Level Showcase Card */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-panel p-5 text-white shadow-md border border-(--gold)/30">
          {/* Top Royal Gold Accent Band */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-600 via-(--gold) to-amber-700" />

          <div>
            {/* Heraldic Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gold">
                <span>⚜️</span> Royal Heraldry
              </span>
              <span className="rounded border border-(--gold)/30 bg-(--gold)/10 px-2 py-0.5 text-[10px] font-bold text-gold">
                Tier {Math.min(10, Math.max(1, rewards.level))}
              </span>
            </div>

            {/* Chronometer Level Dial + XP info */}
            <div className="mt-4 flex items-center gap-4">
              {garden ? (
                <LevelWreath level={rewards.level} progress={rewards.intoLevel / rewards.levelSize} />
              ) : noor ? (
                <NoorRosette level={rewards.level} progress={rewards.intoLevel / rewards.levelSize} />
              ) : (
                <ChronometerDial
                  value={rewards.levelSize > 0 ? rewards.intoLevel / rewards.levelSize : 0}
                  size={88}
                  color="var(--gold)"
                  track="rgba(255, 255, 255, 0.15)"
                  tickColor="rgba(212, 175, 55, 0.55)"
                >
                  <div className="text-center leading-none">
                    <div className="text-[9px] font-black uppercase tracking-widest text-gold/80">Level</div>
                    <div className="num font-display text-[26px] font-black leading-tight text-white">{rewards.level}</div>
                  </div>
                </ChronometerDial>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-display text-[20px] font-black tracking-tight text-white">
                  <Award size={19} className="text-gold shrink-0" />
                  <span className="truncate">{rewards.title}</span>
                </div>
                <div className="num mt-1 text-[13px] font-bold text-amber-200/90">
                  {xp.toLocaleString()} XP earned
                </div>

                {/* Horizontal XP Progress Capsule */}
                <div className="mt-2.5 h-2 w-full max-w-[170px] overflow-hidden rounded-full bg-black/50 p-0.5 border border-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-700 shadow-xs"
                    style={{ width: `${Math.max(4, Math.min(100, (rewards.intoLevel / rewards.levelSize) * 100))}%` }}
                  />
                </div>
                <div className="num mt-1.5 text-[10.5px] font-medium text-white/60">
                  {toNext} XP to level {rewards.level + 1}
                </div>
              </div>
            </div>

            {/* 3 Stat Blocks */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              {facts.map((f) => (
                <div key={f.label} className="rounded-xl border border-white/10 bg-white/5 p-2 text-center transition-colors hover:bg-white/10">
                  <div className="flex items-center justify-center gap-1">
                    {garden && <StatFlora kind={f.key} />}
                    {noor && <StatNoor kind={f.key} />}
                    <div className={`num font-display text-[18px] font-black leading-tight ${
                      f.key === 'streak' ? 'text-gold' : f.key === 'perfect' ? 'text-good' : 'text-white'
                    }`}>
                      {f.value}
                    </div>
                  </div>
                  <div className="mt-0.5 text-[10px] font-medium text-white/60">{f.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/60">
            <span>Every tick: <b className="text-amber-300">+10 XP</b></span>
            <span>Badges: <b className="text-gold">Bonus XP</b></span>
          </div>
        </div>

        {/* Right: 12 Badges Grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
          {BADGES.map((b, i) => {
            const on = rewards.unlocked.has(b.id)
            const Icon = BADGE_ICONS[b.id] ?? Award
            const tier = getBadgeTier(b.xp)
            const progress = getBadgeProgress(b.id, rewards)

            if (garden) {
              return (
                <div
                  key={b.id}
                  className={`badge-tile wk-${(i % 5) + 1} flex items-center gap-3 rounded-2xl border p-3 ${
                    on ? 'is-unlocked border-(--wk-line) bg-(--wk-soft)' : 'border-line bg-surface-2 hover:border-(--wk-line)'
                  }`}
                  style={{ ['--i' as string]: i }}
                >
                  <BadgeBloom unlocked={on} xp={b.xp} index={i} Icon={Icon} />
                  <div className="min-w-0">
                    <div className={`truncate text-[13px] font-bold ${on ? 'text-(--wk-deep)' : 'text-ink-2'}`}>{b.name}</div>
                    <div className={`truncate text-[11.5px] ${on ? 'text-(--wk-deep) opacity-75' : 'text-ink-3'}`} title={b.desc}>
                      {b.desc}
                    </div>
                    <div className={`num mt-0.5 text-[11px] font-bold ${on ? 'text-(--wk-deep)' : 'text-ink-3'}`}>+{b.xp} XP</div>
                  </div>
                </div>
              )
            }

            if (noor) {
              return (
                <div
                  key={b.id}
                  className={`badge-tile flex items-center gap-3 rounded-2xl border p-3 transition-all duration-300 hover:scale-[1.02] ${
                    on
                      ? 'is-unlocked border-(--accent)/50 bg-(--surface) shadow-sm'
                      : 'border-line/40 bg-surface-2/60 opacity-70 hover:opacity-100 hover:border-line'
                  }`}
                  style={{
                    ['--i' as string]: i,
                    boxShadow: on ? '0 4px 18px -4px var(--halo)' : undefined,
                  }}
                >
                  <BadgeNoor unlocked={on} Icon={Icon} />
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-[13px] font-bold ${on ? 'text-ink' : 'text-ink-2'}`}>{b.name}</div>
                    <div className={`truncate text-[11px] ${on ? 'text-ink-3' : 'text-ink-3/70'}`} title={b.desc}>
                      {b.desc}
                    </div>
                    <div className="num mt-0.5 flex items-center justify-between text-[11px] font-bold">
                      <span className={on ? 'text-(--gold)' : 'text-ink-3'}>+{b.xp} XP</span>
                      {!on && (
                        <span className="text-[10px] text-ink-3/80">
                          {Math.round(progress * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            }

            // Concept 1: Royal Vintage Trophy Vault
            if (on) {
              return (
                <div
                  key={b.id}
                  className="badge-tile is-unlocked group relative flex items-center gap-3 rounded-2xl border p-3 transition-all duration-300 hover:scale-[1.02] shadow-xs cursor-pointer overflow-hidden"
                  style={{
                    ['--i' as string]: i,
                    background: 'color-mix(in srgb, var(--surface) 93%, var(--gold))',
                    borderColor: tier.color,
                    boxShadow: `0 4px 16px -4px ${tier.glow}`,
                  }}
                  title={`${b.name}: ${b.desc}`}
                >
                  {/* Shiny Metallic Medallion Icon */}
                  <div
                    className="badge-icon relative grid size-11 shrink-0 place-items-center rounded-xl shadow-xs overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${tier.color} 0%, color-mix(in srgb, ${tier.color} 65%, #000) 100%)`,
                      color: '#ffffff',
                    }}
                  >
                    <Icon size={20} strokeWidth={2.4} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-[13px] font-black text-ink">{b.name}</span>
                      <span
                        className="rounded px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider font-num"
                        style={{ background: tier.softBg, color: tier.color, border: `1px solid ${tier.border}` }}
                      >
                        {tier.label}
                      </span>
                    </div>
                    <div className="truncate text-[11px] text-ink-3 mt-0.5" title={b.desc}>
                      {b.desc}
                    </div>
                    <div className="num mt-1 flex items-center gap-1 text-[11px] font-black" style={{ color: tier.color }}>
                      <span>✨</span> +{b.xp} XP
                    </div>
                  </div>
                </div>
              )
            }

            // Locked State: Engraved Ghost Silhouette with Subtle Micro Lock
            return (
              <div
                key={b.id}
                className="group relative flex items-center gap-3 rounded-2xl border border-line/75 bg-surface-2/65 p-3 transition-all duration-200 hover:bg-surface-2 hover:border-line"
                style={{ ['--i' as string]: i }}
                title={`${b.name} (Locked): ${b.desc}`}
              >
                {/* Engraved Ghost Silhouette with Subtle Lock */}
                <div
                  className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-line/60 bg-surface/80"
                  style={{ color: tier.color }}
                >
                  <div className="opacity-40 transition-opacity duration-200 group-hover:opacity-65">
                    <Icon size={19} strokeWidth={2.2} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full border border-line bg-surface-2 text-ink-3 shadow-xs">
                    <Lock size={8} strokeWidth={2.6} />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-[12.5px] font-bold text-ink-2">{b.name}</span>
                    <span
                      className="text-[9px] font-bold uppercase font-num opacity-70"
                      style={{ color: tier.color }}
                    >
                      {tier.label}
                    </span>
                  </div>
                  <div className="truncate text-[11px] text-ink-3 mt-0.5" title={b.desc}>
                    {b.desc}
                  </div>
                  <div className="num mt-1 flex items-center justify-between text-[10.5px] font-semibold text-ink-3">
                    <span>+{b.xp} XP</span>
                    <span className="text-[9.5px] opacity-75">{Math.round(progress * 100)}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
