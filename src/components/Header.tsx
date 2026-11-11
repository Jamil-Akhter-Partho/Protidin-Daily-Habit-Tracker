import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Download, Plus, Upload } from 'lucide-react'
import { MONTHS } from '../lib/date'
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
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onAdd: () => void
  onExport: () => void
  onImport: (file: File) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <header className="rise relative z-30 flex flex-wrap items-center gap-x-6 gap-y-4">
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 64 64" className="size-11 shrink-0" aria-hidden="true">
          <rect width="64" height="64" rx="16" fill="var(--ink)" />
          <rect x="13" y="13" width="16" height="16" rx="5" fill="var(--w1)" />
          <rect x="35" y="13" width="16" height="16" rx="5" fill="var(--w2)" />
          <rect x="13" y="35" width="16" height="16" rx="5" fill="var(--w3)" />
          <rect x="35" y="35" width="16" height="16" rx="5" fill="var(--w4)" />
          <path d="M39 43.5l3 3 5.5-6" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="leading-tight">
          <div className="font-display text-[22px] font-extrabold tracking-tight">Protidin</div>
          <div className="text-[12.5px] text-ink-3">Daily habit tracker</div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="icon-btn" onClick={onPrev} aria-label="Previous month">
          <ChevronLeft size={20} />
        </button>
        <h1 className="min-w-[230px] text-center font-display text-[28px] font-extrabold tracking-tight">
          {MONTHS[month]} <span className="text-ink-3">{year}</span>
        </h1>
        <button className="icon-btn" onClick={onNext} aria-label="Next month">
          <ChevronRight size={20} />
        </button>
        {!isCurrentMonth && (
          <button className="btn ml-2 !h-8 !px-3 !text-[12.5px]" onClick={onToday}>
            Today
          </button>
        )}
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <LevelChip rewards={rewards} />
        <ThemeMenu theme={theme} />
        <button className="btn" onClick={onExport} title="Download a backup file">
          <Download size={16} /> Backup
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()} title="Restore from a backup file">
          <Upload size={16} /> Restore
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
        <button className="btn btn-primary" onClick={onAdd}>
          <Plus size={17} /> New habit
        </button>
      </div>
    </header>
  )
}
