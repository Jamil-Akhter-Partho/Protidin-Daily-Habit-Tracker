import { useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight, Cloud, Download, Plus, Upload } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { MONTHS } from '../lib/date'
import { getHijriDate } from '../lib/hijri'
import type { Rewards } from '../lib/rewards'
import type { ThemeState } from '../lib/theme'
import { LevelChip } from './Rewards'
import { ThemeMenu } from './ThemeMenu'

export function Header({
  year,
  month,
  isCurrentMonth,
  rewards,
  theme,
  user,
  syncStatus,
  onOpenAuth,
  onPrev,
  onNext,
  onToday,
  onAdd,
  onExport,
  onImport,
}: {
  year: number
  month: number
  isCurrentMonth: boolean
  rewards: Rewards
  theme: ThemeState
  user?: User | null
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error'
  onOpenAuth?: () => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onAdd: () => void
  onExport: () => void
  onImport: (file: File) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const noor = theme.style === 'noor'
  const hijriMonth = useMemo(() => getHijriDate(new Date(year, month, 15)), [year, month])

  return (
    <header className="rise relative z-30 flex flex-wrap items-center gap-x-6 gap-y-4">
      <div className="flex items-center gap-3">
        <img
          src="./icons/icon-192.png"
          alt="Protidin Logo"
          className="size-11 shrink-0 rounded-2xl shadow-sm object-cover border border-(--line)"
        />
        <div className="leading-tight">
          <div className="font-display text-[22px] font-extrabold tracking-tight">Protidin</div>
          <div className="text-[12.5px] text-ink-3">Daily habit tracker</div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="icon-btn" onClick={onPrev} aria-label="Previous month">
          <ChevronLeft size={20} />
        </button>
        <div className="flex min-w-[190px] sm:min-w-[230px] flex-col items-center">
          <h1 className="text-center font-display text-[22px] sm:text-[28px] font-extrabold tracking-tight leading-tight">
            {MONTHS[month]} <span className="text-ink-3">{year}</span>
          </h1>
          {noor && (
            <div className="mt-0.5 inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-surface-2/65 px-2.5 py-0.5 text-[11px] font-bold text-(--gold) shadow-xs transition-all duration-300">
              <span className="text-[10px]">🌙</span>
              <span>{hijriMonth.monthYear}</span>
            </div>
          )}
        </div>
        <button className="icon-btn" onClick={onNext} aria-label="Next month">
          <ChevronRight size={20} />
        </button>
        {!isCurrentMonth && (
          <button className="btn ml-2 !h-8 !px-3 !text-[12.5px]" onClick={onToday}>
            Today
          </button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <LevelChip rewards={rewards} />
        <ThemeMenu theme={theme} />
        {onOpenAuth && (
          <button
            className={`btn !h-[38px] !px-2.5 sm:!px-3 shrink-0 ${
              user ? 'text-emerald-500 font-bold' : 'text-ink-3 hover:text-ink'
            }`}
            onClick={onOpenAuth}
            title={
              user
                ? `Cloud Sync Active (${user.email})`
                : 'Connect Cloud Sync (Phone & Laptop)'
            }
          >
            <Cloud size={16} />
            <span className="hidden md:inline text-xs">
              {user ? 'Synced' : 'Sync'}
            </span>
            {syncStatus === 'syncing' ? (
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
            ) : user ? (
              <span className="size-1.5 rounded-full bg-emerald-500" />
            ) : null}
          </button>
        )}
        <button className="btn !h-[38px] !px-2.5 sm:!px-3.5 shrink-0" onClick={onExport} title="Download a backup file">
          <Download size={16} /> <span className="hidden sm:inline">Backup</span>
        </button>
        <button className="btn !h-[38px] !px-2.5 sm:!px-3.5 shrink-0" onClick={() => fileRef.current?.click()} title="Restore from a backup file">
          <Upload size={16} /> <span className="hidden sm:inline">Restore</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onImport(file)
            e.target.value = ''
          }}
        />
        <button
          className="btn btn-primary !h-[38px] !px-2.5 sm:!px-3.5 !text-[12px] sm:!text-[13.5px] shrink-0"
          onClick={onAdd}
          title="Create a new habit"
        >
          <Plus size={16} /> <span>New habit</span>
        </button>
      </div>
    </header>
  )
}
