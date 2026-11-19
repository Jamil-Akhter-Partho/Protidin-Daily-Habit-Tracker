import { useMemo, type CSSProperties } from 'react'
import { Flame, Moon, Sparkles, Star } from 'lucide-react'
import { MONTHS, WEEKDAY_SHORT, type Today } from '../lib/date'
import { getHijriDate } from '../lib/hijri'
import { useCountUp } from '../lib/hooks'
import type { MonthStats } from '../lib/stats'
import type { State } from '../lib/store'

/* ---------------------------------------------------------------------
   NOOR CENTERPIECE MASTERPIECES (THEME-SPECIFIC & DYNAMICALLY ANIMATED)
   - Light: The Royal Islamic Mihrab (Arch, Fanous Lantern & Noor Star)
   - Dark: The Golden Calligraphy (Onyx Medallion, Rub el Hizb & "نُور")
   - Night: The Peaceful Night (Golden Hilal Crescent & Mosque Silhouette)
   --------------------------------------------------------------------- */

/** 1. LIGHT MODE — The Royal Islamic Mihrab */
function MihrabArt({
  done,
  total,
  full,
}: {
  done: number
  total: number
  full: boolean
}) {
  const ratio = total > 0 ? Math.min(1, done / total) : 0

  const stars = [
    { cx: 48, cy: 78, r: 1.8, delay: '0s' },
    { cx: 68, cy: 50, r: 2.2, delay: '0.6s' },
    { cx: 132, cy: 50, r: 2.2, delay: '1.2s' },
    { cx: 152, cy: 78, r: 1.8, delay: '0.4s' },
  ]

  const starScale = 0.8 + ratio * 0.4
  const auraRadius = 26 + ratio * 28

  return (
    <div className="relative flex size-[210px] shrink-0 items-center justify-center">
      <svg viewBox="0 0 200 200" className="size-full overflow-visible" aria-hidden="true">
        <defs>
          <radialGradient id="mihrabEmeraldBg" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#0b4937" stopOpacity={0.8 + ratio * 0.2} />
            <stop offset="100%" stopColor="#04261b" stopOpacity="0.95" />
          </radialGradient>
          <radialGradient id="mihrabStarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.35 + ratio * 0.45} />
            <stop offset="70%" stopColor="var(--accent)" stopOpacity={0.15 + ratio * 0.25} />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Grand Golden Mihrab Arch */}
        <path
          d="M 30,192 V 92 C 30,50 68,22 100,8 C 132,22 170,50 170,92 V 192 Z"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3.2"
          className="transition-colors duration-500"
          style={{ filter: ratio > 0 ? 'drop-shadow(0 0 8px var(--noor-glow))' : 'none' }}
        />

        {/* Inner Emerald Arch Canvas */}
        <path
          d="M 42,192 V 96 C 42,62 72,38 100,26 C 128,38 158,62 158,96 V 192 Z"
          fill="url(#mihrabEmeraldBg)"
          stroke="var(--gold)"
          strokeWidth="1.6"
          strokeDasharray={full ? 'none' : '4 3'}
          strokeOpacity={0.8}
        />

        {/* Arch Sky Stars */}
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="var(--gold)"
            className="noor-star"
            style={{ animationDelay: s.delay } as CSSProperties}
          />
        ))}

        {/* Central Radiant Noor Star with Dynamic Golden Rays */}
        <g
          className={full ? 'noor-moon-glow' : 'noor-arch-pulse'}
          style={{ transformOrigin: '100px 115px' }}
        >
          {/* Ambient Glow Disk */}
          <circle
            cx="100"
            cy="115"
            r={auraRadius}
            fill="url(#mihrabStarGlow)"
            className="transition-all duration-700"
          />

          {/* Radiating Light Beams (when ratio > 0.15) */}
          {ratio > 0.15 && (
            <g
              stroke="var(--gold)"
              strokeWidth="1.2"
              strokeDasharray="2 3"
              strokeOpacity={0.3 + ratio * 0.4}
              className="transition-opacity duration-700"
            >
              <line x1="100" y1={115 - auraRadius} x2="100" y2={115 + auraRadius} />
              <line x1={100 - auraRadius} y1="115" x2={100 + auraRadius} y2="115" />
              <line x1="78" y1="93" x2="122" y2="137" />
              <line x1="78" y1="137" x2="122" y2="93" />
            </g>
          )}

          {/* 8-Point Rub el Hizb Star */}
          <g transform={`translate(100 115) scale(${starScale}) translate(-100 -115)`}>
            <rect
              x="82"
              y="97"
              width="36"
              height="36"
              rx="4"
              fill="var(--panel)"
              stroke="var(--accent)"
              strokeWidth="2"
            />
            <rect
              x="82"
              y="97"
              width="36"
              height="36"
              rx="4"
              fill="var(--panel)"
              stroke="var(--gold)"
              strokeWidth="2"
              transform="rotate(45 100 115)"
            />
            {/* Center Golden Core */}
            <path
              d="M 100,101 L 103,112 L 114,115 L 103,118 L 100,129 L 97,118 L 86,115 L 97,112 Z"
              fill={ratio > 0 ? 'var(--gold)' : 'var(--accent)'}
              style={{ filter: ratio > 0 ? 'drop-shadow(0 0 6px var(--gold))' : 'none' }}
            />
            <circle cx="100" cy="115" r="3" fill="#ffffff" />
          </g>
        </g>

        {/* Hanging Brass Lantern (Fanous) from Arch Apex */}
        <g className="noor-lantern" style={{ transformOrigin: '100px 26px' }}>
          <line x1="100" y1="26" x2="100" y2="56" stroke="var(--gold)" strokeWidth="1.4" strokeOpacity="0.85" />
          {/* Lantern Dome Cap */}
          <path d="M 93,56 L 107,56 L 110,62 L 90,62 Z" fill="var(--gold)" />
          {/* Lantern Glass Body */}
          <path d="M 91,62 L 109,62 L 106,78 L 94,78 Z" fill="var(--surface-2)" stroke="var(--gold)" strokeWidth="1.2" />
          {/* Live Flame */}
          <circle
            cx="100"
            cy="70"
            r={ratio > 0 ? 3.5 : 2}
            fill={full ? '#ffffff' : 'var(--gold)'}
            style={{ filter: ratio > 0 ? 'drop-shadow(0 0 6px var(--gold))' : 'none' }}
          />
          {/* Lantern Base & Tassel */}
          <path d="M 93,78 L 107,78 L 100,83 Z" fill="var(--gold)" />
        </g>

        {/* Arch Threshold Ground Line */}
        <line x1="26" y1="192" x2="174" y2="192" stroke="var(--line)" strokeWidth="2.5" />
        <circle cx="100" cy="192" r="3.5" fill="var(--gold)" />
      </svg>
    </div>
  )
}

/** 2. DARK MODE — The Golden Calligraphy */
function CalligraphyArt({
  done,
  total,
  full,
}: {
  done: number
  total: number
  full: boolean
}) {
  const ratio = total > 0 ? Math.min(1, done / total) : 0
  const glowIntensity = Math.max(4, Math.round(ratio * 24))

  return (
    <div className="relative flex size-[210px] shrink-0 items-center justify-center">
      <svg viewBox="0 0 200 200" className="size-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="goldCalligraphyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <radialGradient id="darkMedallionAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.25 + ratio * 0.45} />
            <stop offset="65%" stopColor="var(--accent)" stopOpacity={0.08 + ratio * 0.25} />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Medallion Halo */}
        <circle
          cx="100"
          cy="100"
          r={78 + ratio * 14}
          fill="url(#darkMedallionAura)"
          className="transition-all duration-700"
        />

        {/* Pure Onyx Textured Medallion Disc */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="#09090b"
          stroke="var(--accent)"
          strokeWidth="2.5"
          className="transition-all duration-500"
          style={{ filter: ratio > 0 ? `drop-shadow(0 0 ${glowIntensity}px rgba(245, 158, 11, 0.35))` : 'none' }}
        />

        {/* Inner Beaded Concentric Ring */}
        <circle
          cx="100"
          cy="100"
          r="82"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          strokeOpacity={0.45 + ratio * 0.5}
        />

        {/* 8-Point Geometric Rub el Hizb Star Frame */}
        <g
          className={full ? 'noor-moon-glow' : 'noor-arch-pulse'}
          style={{ transformOrigin: '100px 100px' }}
        >
          {/* Square 1 */}
          <rect
            x="48"
            y="48"
            width="104"
            height="104"
            rx="8"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1.6"
            strokeOpacity={0.7 + ratio * 0.3}
          />
          {/* Square 2 (Rotated 45 degrees) */}
          <rect
            x="48"
            y="48"
            width="104"
            height="104"
            rx="8"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1.6"
            transform="rotate(45 100 100)"
            strokeOpacity={0.7 + ratio * 0.3}
          />

          {/* Tip Accents when active */}
          {ratio > 0 && (
            <>
              <circle cx="100" cy="27" r="2.4" fill="var(--gold)" className="noor-star" />
              <circle cx="100" cy="173" r="2.4" fill="var(--gold)" className="noor-star" />
              <circle cx="27" cy="100" r="2.4" fill="var(--gold)" className="noor-star" />
              <circle cx="173" cy="100" r="2.4" fill="var(--gold)" className="noor-star" />
            </>
          )}
        </g>

        {/* Center Sanctuary Medallion Plate */}
        <circle cx="100" cy="100" r="44" fill="#121217" stroke="var(--line)" strokeWidth="1.2" />

        {/* Golden Arabic Calligraphy: نُور (Noor) */}
        <g className="transition-all duration-700" style={{ transformOrigin: '100px 105px' }}>
          <text
            x="100"
            y="116"
            textAnchor="middle"
            fontSize="44"
            fontFamily="'Amiri', 'Traditional Arabic', 'Scheherazade New', serif"
            fontWeight="bold"
            fill={ratio > 0 ? 'url(#goldCalligraphyGrad)' : 'var(--accent)'}
            fillOpacity={ratio > 0 ? 1 : 0.7}
            style={{
              filter: ratio > 0 ? `drop-shadow(0 0 ${glowIntensity}px var(--gold))` : 'none',
              letterSpacing: '2px',
            }}
          >
            نُور
          </text>
        </g>

        {/* Mini Tashkeel / Calligraphy flourish */}
        <circle cx="100" cy="68" r="2" fill="var(--gold)" opacity={ratio > 0 ? 1 : 0.4} />
      </svg>
    </div>
  )
}

/** 3. NIGHT MODE — The Peaceful Night */
function NightCrescentArt({
  done,
  total,
  full,
}: {
  done: number
  total: number
  full: boolean
}) {
  const ratio = total > 0 ? Math.min(1, done / total) : 0
  const moonGlow = 10 + ratio * 22

  const stars = [
    { cx: 152, cy: 38, r: 2.2, minRatio: 0, delay: '0s' },
    { cx: 48, cy: 62, r: 1.8, minRatio: 0.15, delay: '0.8s' },
    { cx: 168, cy: 110, r: 1.6, minRatio: 0.3, delay: '1.4s' },
    { cx: 38, cy: 118, r: 1.9, minRatio: 0.5, delay: '0.4s' },
    { cx: 138, cy: 26, r: 2.4, minRatio: 0.7, delay: '1.1s' },
    { cx: 62, cy: 36, r: 1.7, minRatio: 0.85, delay: '0.6s' },
  ]

  return (
    <div className="relative flex size-[210px] shrink-0 items-center justify-center">
      <svg viewBox="0 0 200 200" className="size-full overflow-visible" aria-hidden="true">
        <defs>
          <radialGradient id="nightSkyGlow" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity={0.25 + ratio * 0.35} />
            <stop offset="60%" stopColor="#0b1a36" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="crescentGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>

        {/* Ambient Night Starlight Aura */}
        <circle
          cx="100"
          cy="95"
          r={75 + ratio * 15}
          fill="url(#nightSkyGlow)"
          className="transition-all duration-700"
        />

        {/* Celestial Stars (revealing with progress) */}
        {stars.map((s, i) => {
          const visible = ratio >= s.minRatio
          return (
            <circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill={i % 2 === 0 ? '#ffffff' : 'var(--gold)'}
              className={visible ? 'noor-star' : 'transition-opacity duration-500 opacity-20'}
              style={{
                animationDelay: s.delay,
                opacity: visible ? undefined : 0.15,
              } as CSSProperties}
            />
          )
        })}

        {/* Grand Golden Crescent Moon (Hilal) & Mosque Silhouette */}
        <g
          className={full ? 'noor-moon-glow' : 'noor-arch-pulse'}
          style={{ transformOrigin: '100px 100px' }}
        >
          {/* Golden Crescent Moon */}
          <path
            d="M 100,18 A 76,76 0 1 0 176,94 A 65,65 0 1 1 100,18 Z"
            fill="url(#crescentGold)"
            className="transition-all duration-700"
            style={{
              filter: `drop-shadow(0 0 ${moonGlow}px rgba(250, 204, 21, ${0.45 + ratio * 0.45}))`,
            }}
          />

          {/* Mosque Base Silhouette inside the crescent */}
          <path
            d="M 58,168 H 142 V 138 Q 100,108 58,138 Z"
            fill="var(--surface-2)"
            stroke="var(--line)"
            strokeWidth="0.8"
          />

          {/* Central Dome */}
          <path
            d="M 84,138 C 84,116 100,102 100,92 C 100,102 116,116 116,138 Z"
            fill="var(--panel)"
            stroke="var(--gold)"
            strokeWidth="1"
          />
          {/* Central Dome Finial Crescent */}
          <circle cx="100" cy="90" r="2.2" fill="var(--gold)" />
          <path d="M 98,87 A 3,3 0 1 0 102,90 A 2.2,2.2 0 1 1 98,87 Z" fill="var(--gold)" />

          {/* Left Minaret */}
          <rect x="62" y="110" width="7" height="58" fill="var(--panel)" stroke="var(--line)" strokeWidth="0.6" />
          <polygon points="61.5,110 65.5,100 69.5,110" fill="var(--gold)" />

          {/* Right Minaret */}
          <rect x="131" y="110" width="7" height="58" fill="var(--panel)" stroke="var(--line)" strokeWidth="0.6" />
          <polygon points="130.5,110 134.5,100 138.5,110" fill="var(--gold)" />
        </g>

        {/* Base Horizon Ground Line */}
        <line x1="26" y1="188" x2="174" y2="188" stroke="var(--line)" strokeWidth="2" />
        <circle cx="100" cy="188" r="3" fill="var(--gold)" />
      </svg>
    </div>
  )
}

/* ---------------------------------------------------------------------
   NOOR HERO COMPONENT
   --------------------------------------------------------------------- */
export function NoorHero({
  stats,
  state,
  todayDone,
  isCurrentMonth,
  year,
  month,
  today,
  activeTheme = 'dark',
}: {
  stats: MonthStats
  state: State
  todayDone: number
  isCurrentMonth: boolean
  year: number
  month: number
  today: Today
  activeTheme?: 'light' | 'dark' | 'night'
}) {
  const habitCount = state.habits.length
  const left = Math.max(0, habitCount - todayDone)
  const full = habitCount > 0 && todayDone >= habitCount
  const topStreak = stats.perHabit.reduce((best, h) => Math.max(best, h.streak), 0)
  const animatedDone = useCountUp(todayDone)
  const pct = habitCount > 0 ? Math.round((todayDone / habitCount) * 100) : 0

  const statusLabel =
    activeTheme === 'light'
      ? full
        ? 'Mihrab Complete ✨'
        : 'Mihrab Radiance'
      : activeTheme === 'dark'
        ? full
          ? 'نُورٌ عَلَىٰ نُور ✨'
          : 'Calligraphy Radiance'
        : full
          ? 'Celestial Peace ✨'
          : 'Peaceful Night'

  const monthName = MONTHS[month]
  const viewHijri = useMemo(() => getHijriDate(new Date(year, month, 15)), [year, month])
  const todayHijri = useMemo(() => getHijriDate(new Date(today.y, today.m, today.d)), [today.key])

  // Dynamic Spiritual Caption
  const caption = !habitCount
    ? 'Begin your journey — add your first daily habit'
    : !isCurrentMonth
      ? `This month reached ${Math.round(stats.monthPct * 100)}% of its target deeds`
      : full
        ? 'Alhamdulillah! All your good deeds are fulfilled today'
        : todayDone === 0
          ? 'Start with Bismillah — tick your first good deed today'
          : `${todayDone} fulfilled · ${left} more to complete your radiance`

  const barakahStats = useMemo(
    () => [
      {
        id: 'today',
        label: 'Daily Radiance',
        val: `${animatedDone}/${habitCount}`,
        sub: left === 0 ? 'All completed ✨' : `${left} left for full light`,
        Icon: Moon,
        accent: 'var(--accent)',
      },
      {
        id: 'monthly',
        label: 'Monthly Barakah',
        val: `${Math.round(stats.monthPct * 100)}%`,
        sub: `${stats.monthDone} of ${stats.monthGoal} target deeds`,
        Icon: Star,
        accent: 'var(--gold)',
      },
      {
        id: 'streak',
        label: 'Istiqamah',
        val: `${topStreak}d`,
        sub: topStreak > 0 ? 'Steadfast consistency' : 'Start your streak',
        Icon: topStreak >= 7 ? Flame : Sparkles,
        accent: topStreak >= 7 ? 'var(--flame)' : 'var(--accent)',
      },
    ],
    [animatedDone, habitCount, left, stats.monthPct, stats.monthDone, stats.monthGoal, topStreak],
  )

  return (
    <section
      className="card rise relative overflow-hidden p-6 sm:p-7"
      style={{
        ['--i' as string]: 1,
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
      }}
      aria-label="Noor Daily Radiance"
    >
      {/* Decorative Golden Arch Filigree Top Border */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-(--accent) to-transparent opacity-80"
        aria-hidden="true"
      />

      {/* Header Banner & Spiritual Ribbon */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-(--line) pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <span className="text-[12px] font-extrabold uppercase tracking-widest text-(--accent)">
              Noor Dashboard · نُور
            </span>
          </div>
          <h2 className="mt-1 font-display text-[22px] sm:text-[24px] font-extrabold text-ink tracking-tight">
            {monthName} {year}
          </h2>
        </div>

        <div className="text-right">
          <div className="font-serif text-[22px] sm:text-[24px] text-(--accent) font-bold" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
          <div className="mt-1 flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-ink">
              <span>{monthName} {year}</span>
              <span className="text-(--accent) opacity-60">/</span>
              <span className="text-(--gold)">{viewHijri.monthYear}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-3">
              <span>Today:</span>
              <span className="font-bold text-ink-2">{todayHijri.formatted}</span>
              <span className="font-serif text-(--accent)" dir="rtl">({todayHijri.formattedAr})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Hero Split: Left Centerpiece + Right Barakah Cards */}
      <div className="grid gap-6 lg:grid-cols-[340px_1fr] items-center">
        {/* Left: Dynamic Signature Centerpiece (Adapts to Light / Dark / Night) */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-(--line) bg-black/20 p-5 backdrop-blur-xs text-center transition-all duration-500">
          <div key={activeTheme} className="transition-all duration-500">
            {activeTheme === 'light' ? (
              <MihrabArt done={todayDone} total={habitCount} full={full} />
            ) : activeTheme === 'dark' ? (
              <CalligraphyArt done={todayDone} total={habitCount} full={full} />
            ) : (
              <NightCrescentArt done={todayDone} total={habitCount} full={full} />
            )}
          </div>

          {/* Dedicated Radiance Status Capsule (Zero Overlap, Pristine Margins) */}
          <div className="mt-3 flex items-center justify-center">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-center shadow-xs backdrop-blur-xs transition-all duration-300 ${
                full
                  ? 'border-(--gold)/70 bg-(--gold)/15 text-(--gold) shadow-sm'
                  : 'border-(--line) bg-black/25 text-ink-2'
              }`}
            >
              <span className="num font-display text-[14px] font-black tracking-tight text-ink">
                {pct}%
              </span>
              <span className="text-[10px] text-(--gold) opacity-80">۞</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-(--accent)">
                {statusLabel}
              </span>
            </div>
          </div>

          <p className="mt-2.5 text-[13.5px] font-bold text-ink max-w-[280px] leading-snug">
            {caption}
          </p>
          <div className="mt-1 text-[11px] text-ink-3">
            {activeTheme === 'light'
              ? 'The Royal Islamic Mihrab · Consistency is loved by Allah'
              : activeTheme === 'dark'
                ? 'The Golden Calligraphy · Light upon light (نُورٌ عَلَىٰ نُور)'
                : 'The Peaceful Night · Find peace in remembrance'}
          </div>
        </div>

        {/* Right: Barakah Metrics & Daily Reflection Card */}
        <div className="flex flex-col justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {barakahStats.map((item) => {
              const Icon = item.Icon
              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-(--line) bg-black/15 p-4 transition-all duration-300 hover:border-(--accent) hover:translate-y-[-2px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-bold uppercase tracking-wider text-ink-3">
                      {item.label}
                    </span>
                    <span
                      className="grid size-7 place-items-center rounded-lg bg-black/30 text-(--accent) border border-(--line)"
                      style={{ color: item.accent }}
                    >
                      <Icon size={15} />
                    </span>
                  </div>

                  <div className="my-3">
                    <div className="num font-display text-[28px] font-black text-ink leading-none">
                      {item.val}
                    </div>
                  </div>

                  <div className="truncate text-[11px] font-medium text-ink-3">
                    {item.sub}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Daily Motivational Reflection Ribbon */}
          <div className="rounded-2xl border border-(--line) bg-black/25 p-4 flex items-center gap-3.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-(--accent)/15 text-(--accent) border border-(--accent)/30">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-ink">
                Spiritual Habit Principle
              </div>
              <div className="text-[11.5px] text-ink-3 leading-relaxed">
                “The most beloved of deeds to Allah are those that are most consistent, even if they are few.”
                <span className="ml-1 opacity-70">(Sahih al-Bukhari)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------
   NOOR LANTERN (FANOUS / ফানুস) FOR DAILY HABIT GRID
   --------------------------------------------------------------------- */
export function NoorLantern({ stage, size = 38 }: { stage: number; size?: number }) {
  if (stage === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 40" className="overflow-visible" aria-hidden="true">
        {/* Slender resting celestial crescent outline */}
        <path
          d="M 16,8 A 9,9 0 1 0 25,17 A 7.5,7.5 0 1 1 16,8 Z"
          fill="var(--line)"
          opacity="0.45"
        />
        <circle cx="16" cy="36" r="1.5" fill="var(--line)" opacity="0.4" />
      </svg>
    )
  }

  const isFull = stage === 5
  const isHigh = stage >= 4

  return (
    <svg
      width={size}
      height={size + 4}
      viewBox="0 0 32 44"
      className="overflow-visible noor-lantern"
      style={{ transformOrigin: '16px 2px' }}
      aria-hidden="true"
    >
      {/* Hanging Chain from Top */}
      <line x1="16" y1="0" x2="16" y2="10" stroke="var(--accent)" strokeWidth="1.2" strokeOpacity="0.8" />

      {/* Ambient Glow for higher stages */}
      {stage >= 2 && (
        <circle
          cx="16"
          cy="22"
          r={isFull ? 16 : 11}
          fill="var(--accent)"
          fillOpacity={isFull ? 0.35 : 0.18}
          className={isFull ? 'noor-moon-glow' : undefined}
        />
      )}

      {/* Lantern Top Cap & Finial */}
      <circle cx="16" cy="10" r="1.8" fill="var(--accent)" />
      <path d="M 11,13 L 21,13 L 23,16 L 9,16 Z" fill="var(--accent)" />

      {/* Lantern Body Cage (Islamic Geometric Facets) */}
      <path
        d="M 10,16 L 22,16 L 19,30 L 13,30 Z"
        fill="var(--panel)"
        stroke="var(--accent)"
        strokeWidth="1.2"
      />

      {/* Internal Glowing Flame (Radiance scales with stage) */}
      <circle
        cx="16"
        cy="22"
        r={isFull ? 4.5 : stage >= 3 ? 3.5 : 2.5}
        fill={isFull ? '#ffffff' : 'var(--gold)'}
        filter={stage >= 2 ? 'drop-shadow(0 0 5px var(--gold))' : undefined}
      />

      {/* Vertical Brass Grilles */}
      <line x1="14" y1="16" x2="15" y2="30" stroke="var(--accent)" strokeWidth="0.8" strokeOpacity="0.7" />
      <line x1="18" y1="16" x2="17" y2="30" stroke="var(--accent)" strokeWidth="0.8" strokeOpacity="0.7" />

      {/* Lantern Base & Hanging Drop */}
      <path d="M 12,30 L 20,30 L 16,34 Z" fill="var(--accent)" />
      {isHigh && <circle cx="16" cy="36" r="1.2" fill="var(--gold)" />}

      {/* Stage 5 Perfect Day Sparkle Crown */}
      {isFull && (
        <path
          d="M 16,3 L 17.2,5.5 L 19.8,6.2 L 17.8,7.8 L 18.5,10.2 L 16,8.8 L 13.5,10.2 L 14.2,7.8 L 12.2,6.2 L 14.8,5.5 Z"
          fill="var(--gold)"
          className="noor-star"
        />
      )}
    </svg>
  )
}

/* ---------------------------------------------------------------------
   NOOR MINARET VELOCITY CHART (৭ দিনের মিনার চার্ট)
   --------------------------------------------------------------------- */
export function MinaretChart({ stats }: { stats: MonthStats }) {
  const vals = stats.perWeekday
  const best = vals.reduce<number>((b, v, i) => (v != null && v > 0 && (b < 0 || v > (vals[b] ?? 0)) ? i : b), -1)

  return (
    <section
      className="card rise flex flex-col p-5"
      style={{
        ['--i' as string]: 7,
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
      }}
      aria-label="Minaret Velocity Chart"
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-(--accent)">
            <span>🕌</span> Weekly Velocity
          </div>
          <h2 className="font-display text-[18px] font-bold text-ink mt-0.5">Minaret Strength</h2>
        </div>
        <span className="rounded-xl border border-(--line) bg-black/20 px-2.5 py-1 text-[11.5px] font-bold text-(--accent)">
          {best >= 0 ? `Best: ${WEEKDAY_SHORT[best]}` : 'No data yet'}
        </span>
      </div>
      <p className="text-[12px] text-ink-3 mb-4">
        Each minaret reaches toward the sky with your daily habit completion.
      </p>

      {/* 7 Minarets Row */}
      <div className="flex min-h-[220px] flex-1 items-end gap-2.5 pt-2">
        {vals.map((v, i) => {
          const isTop = i === best && v != null && v > 0
          const isFriday = i === 5 // Jumu'ah
          const pct = v != null ? Math.round(v * 100) : 0
          const heightRatio = Math.max(0.12, Math.min(1, v ?? 0.08))

          return (
            <div
              key={i}
              className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              title={v == null ? 'No days yet' : `${WEEKDAY_SHORT[i]}: ${pct}% average`}
            >
              {/* Percentage Header */}
              <span className={`num text-[10.5px] font-bold transition-all ${isTop ? 'text-(--gold) scale-110' : 'text-ink-3'}`}>
                {v == null ? '–' : `${pct}%`}
              </span>

              {/* Minaret Column */}
              <div className="relative flex w-full flex-1 items-end justify-center">
                {/* Minaret Body Container */}
                <div
                  className="relative flex w-full max-w-[34px] flex-col items-center justify-end transition-all duration-700"
                  style={{ height: `${heightRatio * 100}%` }}
                >
                  {/* Minaret Spire & Crescent Finial */}
                  <div className="relative flex flex-col items-center -mb-0.5">
                    {/* Golden Crescent Finial */}
                    <svg width="12" height="12" viewBox="0 0 16 16" className={isTop ? 'noor-moon-glow' : undefined}>
                      <path
                        d="M 8,2 A 6,6 0 1 0 14,8 A 5,5 0 1 1 8,2 Z"
                        fill={isTop ? 'var(--gold)' : 'var(--accent)'}
                      />
                    </svg>
                    {/* Conical Spire Dome */}
                    <div
                      className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[14px]"
                      style={{ borderBottomColor: isTop ? 'var(--gold)' : 'var(--accent)' }}
                    />
                  </div>

                  {/* Minaret Balcony Railing */}
                  <div
                    className="h-2 w-[116%] rounded-xs border border-(--line) z-1"
                    style={{ background: isTop ? 'var(--gold)' : 'var(--accent)' }}
                  />

                  {/* Minaret Tower Shaft */}
                  <div
                    className="w-full flex-1 rounded-t-xs border border-(--line) relative overflow-hidden flex justify-around"
                    style={{
                      background: isTop
                        ? 'linear-gradient(180deg, var(--gold) 0%, var(--accent) 100%)'
                        : isFriday
                          ? 'linear-gradient(180deg, var(--surface-2) 0%, var(--panel) 100%)'
                          : 'var(--surface-2)',
                    }}
                  >
                    {/* Fluting Lines */}
                    <div className="w-[1px] h-full bg-black/20" />
                    <div className="w-[1px] h-full bg-black/20" />
                  </div>

                  {/* Minaret Base / Pedestal */}
                  <div className="h-2 w-[124%] rounded-xs bg-black/40 border-t border-(--line)" />
                </div>
              </div>

              {/* Weekday Label */}
              <span
                className={`text-[11px] font-bold ${
                  isTop ? 'text-(--gold)' : isFriday ? 'text-(--accent)' : 'text-ink-2'
                }`}
              >
                {WEEKDAY_SHORT[i]}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------
   NOOR WEEKLY HILALS (সাপ্তাহিক বরকত সার্কেল)
   --------------------------------------------------------------------- */
function HilalRing({ pct, crown = false }: { pct: number; index: number; crown?: boolean }) {
  const full = pct >= 1
  const lit = Math.round(pct * 100)

  return (
    <svg width="92" height="92" viewBox="0 0 100 100" className="overflow-visible" aria-hidden="true">
      {/* Outer 8-Point Islamic Star / Notches */}
      <g className={crown ? 'noor-arch-pulse' : undefined} style={{ transformOrigin: '50px 50px' }}>
        <rect
          x="12"
          y="12"
          width="76"
          height="76"
          rx="12"
          fill="none"
          stroke={crown ? 'var(--gold)' : 'var(--line)'}
          strokeWidth="1.2"
          strokeOpacity={pct > 0 ? 0.75 : 0.35}
        />
        <rect
          x="12"
          y="12"
          width="76"
          height="76"
          rx="12"
          fill="none"
          stroke={crown ? 'var(--gold)' : 'var(--line)'}
          strokeWidth="1.2"
          strokeOpacity={pct > 0 ? 0.75 : 0.35}
          transform="rotate(45 50 50)"
        />
      </g>

      {/* Main Dial Surface */}
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="var(--surface)"
        stroke={crown ? 'var(--gold)' : 'var(--line)'}
        strokeWidth="1.6"
      />

      {/* Crescent Moon Fill or Star */}
      {crown ? (
        <g className="noor-moon-glow" style={{ transformOrigin: '50px 50px' }}>
          <circle cx="50" cy="50" r="24" fill="var(--panel)" stroke="var(--gold)" strokeWidth="1.5" />
          <path
            d="M 50,32 A 18,18 0 1 0 68,50 A 15,15 0 1 1 50,32 Z"
            fill="var(--gold)"
          />
        </g>
      ) : (
        <path
          d="M 50,22 A 28,28 0 1 0 78,50 A 24,24 0 1 1 50,22 Z"
          fill={pct > 0 ? 'var(--accent)' : 'var(--line)'}
          fillOpacity={pct > 0 ? (full ? 1 : 0.75) : 0.25}
          style={{ transition: 'all 0.5s ease' }}
        />
      )}

      {/* Percentage Center Readout */}
      <text
        x="50"
        y="55"
        textAnchor="middle"
        fontSize="15"
        fontWeight="900"
        fill={crown ? '#ffffff' : 'var(--ink)'}
        className="num font-display"
      >
        {lit}%
      </text>

      {/* Full Completion Twinkling Star */}
      {full && (
        <circle cx="80" cy="20" r="3" fill="var(--gold)" className="noor-star" />
      )}
    </svg>
  )
}

export function WeeklyHilals({
  stats,
  month,
  className = '',
}: {
  stats: MonthStats
  month: number
  className?: string
}) {
  const mon = MONTHS[month].slice(0, 3)

  return (
    <section
      className={`card rise flex flex-col p-5 ${className}`}
      style={{
        ['--i' as string]: 8,
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
      }}
      aria-label="Weekly Barakah Hilals"
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-(--accent)">
            <span>🌙</span> Monthly Journey
          </div>
          <h2 className="font-display text-[18px] font-bold text-ink mt-0.5">Progress per week</h2>
        </div>
        <span className="text-[12px] text-ink-3">Weekly habit completion velocity</span>
      </div>

      <div className="my-auto grid grid-cols-3 gap-3 xl:grid-cols-6">
        {stats.perWeek.map(({ week, done, possible, pct }) => (
          <div
            key={week.index}
            className={`flex flex-col items-center rounded-2xl p-3 text-center border border-(--line) bg-black/20 hover:border-(--accent) transition-all duration-300 hover:translate-y-[-2px]`}
          >
            <HilalRing pct={pct} index={week.index} />
            <div className="mt-2.5 text-[12.5px] font-bold text-ink">
              Week {week.index + 1}
            </div>
            <div className="num text-[11px] text-ink-3 mt-0.5">
              {mon} {week.start}–{week.end} · {done}/{possible}
            </div>
          </div>
        ))}

        {/* Whole Month Grand Barakah Card */}
        <div className="flex flex-col items-center rounded-2xl p-3 text-center border-2 border-(--gold) bg-black/40 text-white shadow-lg hover:translate-y-[-2px] transition-all">
          <HilalRing pct={stats.monthPct} index={5} crown />
          <div className="mt-2.5 text-[12.5px] font-extrabold text-(--gold)">
            Whole month
          </div>
          <div className="num text-[11px] text-white/80 mt-0.5">
            {stats.monthDone}/{stats.monthGoal} goal days
          </div>
        </div>
      </div>
    </section>
  )
}
