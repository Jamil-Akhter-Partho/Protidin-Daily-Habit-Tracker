import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Confetti, Floaters, RewardPopup, type CelebrationEvent, type Floater } from './components/Celebration'
import { WeekdayChart, WeeklyDonuts } from './components/Charts'
import { RhythmChart } from './components/RhythmChart'
import { GardenHero, WeekdayFlower, WeeklyBlooms } from './components/Garden'
import { NoorHero, MinaretChart, WeeklyHilals } from './components/Noor'
import { HabitGrid } from './components/HabitGrid'
import { HabitModal } from './components/HabitModal'
import { Header } from './components/Header'
import { ConfirmDialog } from './components/Modal'
import { RewardsPanel } from './components/Rewards'
import { StatCards } from './components/StatCards'
import { ProfileMenu } from './components/ProfileMenu'
import { InstallPopup } from './components/InstallPopup'
import { AuthModal } from './components/AuthModal'
import { MobileHabitView } from './components/MobileHabitView'
import { useIsDesktop, useToday } from './lib/hooks'
import { BADGES, computeRewards, XP_PER_CHECK } from './lib/rewards'
import { monthStats } from './lib/stats'
import { useTheme } from './lib/theme'
import { ck, parseState, reducer, useStore, type Action, type Habit, type State } from './lib/store'

type ModalState = { kind: 'new' } | { kind: 'edit'; habit: Habit } | null
type ConfirmState = { title: string; body: string; confirmLabel: string; danger?: boolean; run: () => void } | null

export default function App() {
  const { state, dispatch, user, syncStatus, lastSyncedAt } = useStore()
  const today = useToday()
  const [view, setView] = useState({ y: today.y, m: today.m })
  const [modal, setModal] = useState<ModalState>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmState>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [queue, setQueue] = useState<CelebrationEvent[]>([])
  const [burst, setBurst] = useState(0)
  const [floaters, setFloaters] = useState<Floater[]>([])
  const [forceDesktop, setForceDesktop] = useState(false)
  const isDesktop = useIsDesktop()
  const seq = useRef(0)
  const theme = useTheme()
  const garden = theme.style === 'garden'
  const noor = theme.style === 'noor'
  const activeTheme: 'light' | 'dark' | 'night' =
    theme.choice === 'system'
      ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme.choice

  const stats = useMemo(() => monthStats(state, view.y, view.m, today), [state, view, today])
  const rewards = useMemo(() => computeRewards(state), [state])
  const todayDone = state.habits.filter((h) => state.checks[ck(h.id, today.key)]).length
  const isCurrentMonth = view.y === today.y && view.m === today.m

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(id)
  }, [toast])

  const shiftMonth = (delta: number) =>
    setView(({ y, m }) => {
      const n = y * 12 + m + delta
      return { y: Math.floor(n / 12), m: ((n % 12) + 12) % 12 }
    })

  const handleToggle = (id: string, date: string, el: HTMLElement) => {
    const action: Action = { type: 'toggle', id, date }
    const next = reducer(state, action)
    dispatch(action)
    if (!next.checks[ck(id, date)]) return // unticked: nothing to celebrate

    const rect = el.getBoundingClientRect()
    setFloaters((f) => [
      ...f,
      { id: ++seq.current, x: rect.left + rect.width / 2, y: rect.top, text: `+${XP_PER_CHECK} XP` },
    ])

    const before = computeRewards(state)
    const after = computeRewards(next)
    const events: CelebrationEvent[] = []

    const allDone = (s: State) => s.habits.length > 0 && s.habits.every((h) => s.checks[ck(h.id, today.key)])
    if (date === today.key && allDone(next) && !allDone(state)) {
      events.push({ id: ++seq.current, kind: 'perfect', title: 'Every habit done!', subtitle: 'That is a perfect day.' })
    }
    for (const badge of BADGES) {
      if (after.unlocked.has(badge.id) && !before.unlocked.has(badge.id)) {
        events.push({ id: ++seq.current, kind: 'badge', badgeId: badge.id, title: badge.name, subtitle: `${badge.desc} · +${badge.xp} XP` })
      }
    }
    if (after.level > before.level) {
      events.push({ id: ++seq.current, kind: 'level', title: `Level ${after.level}`, subtitle: `You are now ${after.title}` })
    }
    if (events.length) {
      // A newer level-up replaces older ones still waiting, so popups never pile up.
      const levelled = events.some((e) => e.kind === 'level')
      setQueue((q) => [...q.filter((e, i) => i === 0 || !levelled || e.kind !== 'level'), ...events])
      setBurst((b) => b + 1)
    }
  }

  const dismissPopup = useCallback(() => setQueue((q) => q.slice(1)), [])
  const removeFloater = useCallback((id: number) => setFloaters((f) => f.filter((x) => x.id !== id)), [])

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `protidin-backup-${today.key}.json`
    a.click()
    URL.revokeObjectURL(url)
    setToast('Backup file downloaded')
  }

  const importBackup = async (file: File) => {
    let parsed: State | null = null
    try {
      parsed = parseState(JSON.parse(await file.text()))
    } catch {
      parsed = null
    }
    if (!parsed) {
      setToast('That file is not a Protidin backup')
      return
    }
    const incoming = parsed
    setConfirm({
      title: 'Restore this backup?',
      body: `It contains ${incoming.habits.length} habits and ${Object.keys(incoming.checks).length} ticks. Everything currently in the app will be replaced.`,
      confirmLabel: 'Replace my data',
      danger: true,
      run: () => {
        dispatch({ type: 'replace', state: incoming })
        setToast('Backup restored')
      },
    })
  }

  const askDelete = (habit: Habit) =>
    setConfirm({
      title: 'Delete this habit?',
      body: `"${habit.name}" and all of its ticks will be removed. This cannot be undone.`,
      confirmLabel: 'Delete habit',
      danger: true,
      run: () => {
        dispatch({ type: 'delete', id: habit.id })
        setModal(null)
      },
    })

  return (
    <div className="mx-auto max-w-[1640px] space-y-5 px-6 py-6">
      <Header
        year={view.y}
        month={view.m}
        isCurrentMonth={isCurrentMonth}
        rewards={rewards}
        theme={theme}
        user={user}
        syncStatus={syncStatus}
        onOpenAuth={() => setAuthOpen(true)}
        onPrev={() => shiftMonth(-1)}
        onNext={() => shiftMonth(1)}
        onToday={() => setView({ y: today.y, m: today.m })}
        onAdd={() => setModal({ kind: 'new' })}
        onExport={exportBackup}
        onImport={importBackup}
      />

      {/* Mobile banner when viewing full desktop grid on mobile */}
      {forceDesktop && (
        <div className="lg:hidden flex items-center justify-between rounded-2xl bg-accent/15 border border-accent/30 px-4 py-2 text-xs font-bold text-accent">
          <span>Viewing 31-Day Desktop Grid</span>
          <button
            className="btn !h-7 !px-2.5 !text-[11px]"
            onClick={() => setForceDesktop(false)}
          >
            📱 Return to Mobile View
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* DESKTOP & LAPTOP VIEW (screens >= 1024px, or forceDesktop)    */}
      {/* 100% UNTOUCHED, EXACTLY AS ORIGINALLY CRAFTED                 */}
      {/* ============================================================ */}
      {(isDesktop || forceDesktop) && (
        <div className={forceDesktop ? 'space-y-5' : 'hidden lg:block space-y-5'}>
          {garden ? (
            <GardenHero
              key={`${view.y}-${view.m}`}
              stats={stats}
              state={state}
              todayDone={todayDone}
              isCurrentMonth={isCurrentMonth}
              year={view.y}
              month={view.m}
              today={today}
            />
          ) : noor ? (
            <NoorHero
              key={`noor-${view.y}-${view.m}`}
              activeTheme={activeTheme}
              stats={stats}
              state={state}
              todayDone={todayDone}
              isCurrentMonth={isCurrentMonth}
              year={view.y}
              month={view.m}
              today={today}
            />
          ) : (
            <StatCards stats={stats} todayDone={todayDone} habitCount={state.habits.length} />
          )}

          <HabitGrid
            garden={garden}
            noor={noor}
            stats={stats}
            checks={state.checks}
            year={view.y}
            month={view.m}
            today={today}
            onToggle={handleToggle}
            onEdit={(habit) => setModal({ kind: 'edit', habit })}
            onMove={(id, dir) => dispatch({ type: 'move', id, dir })}
            onAdd={() => setModal({ kind: 'new' })}
          />

          {/* key: replay the chart entrance animation when the month changes */}
          {garden ? (
            <div className="grid gap-5 xl:grid-cols-3" key={`g-${view.y}-${view.m}`}>
              <WeekdayFlower stats={stats} />
              <WeeklyBlooms stats={stats} month={view.m} className="xl:col-span-2" />
            </div>
          ) : noor ? (
            <div className="grid gap-5 xl:grid-cols-3" key={`n-${view.y}-${view.m}`}>
              <MinaretChart stats={stats} />
              <WeeklyHilals stats={stats} month={view.m} className="xl:col-span-2" />
            </div>
          ) : (
            <>
              <div className="grid gap-5 xl:grid-cols-3" key={`${view.y}-${view.m}`}>
                <RhythmChart stats={stats} state={state} year={view.y} month={view.m} today={today} />
                <WeekdayChart stats={stats} />
              </div>
              <WeeklyDonuts stats={stats} month={view.m} />
            </>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MOBILE & TABLET VIEW (screens < 1024px when not forceDesktop) */}
      {/* ============================================================ */}
      {!isDesktop && !forceDesktop && (
        <div className="block lg:hidden space-y-4">
          <MobileHabitView
            stats={stats}
            state={state}
            year={view.y}
            month={view.m}
            today={today}
            theme={theme}
            todayDone={todayDone}
            isCurrentMonth={isCurrentMonth}
            onToggle={handleToggle}
            onEdit={(habit) => setModal({ kind: 'edit', habit })}
            onAdd={() => setModal({ kind: 'new' })}
            onSwitchToDesktop={() => setForceDesktop(true)}
          />
        </div>
      )}
      <RewardsPanel rewards={rewards} garden={garden} noor={noor} />

      <footer className="pb-4 pt-1 text-center text-[12px] text-ink-3">
        Your data is saved in this browser only. Use Backup to keep a copy.
      </footer>

      {modal && (
        <HabitModal
          habit={modal.kind === 'edit' ? modal.habit : null}
          daysThisMonth={stats.dim}
          onClose={() => setModal(null)}
          onDelete={modal.kind === 'edit' ? () => askDelete(modal.habit) : undefined}
          onSave={(h) => {
            if (modal.kind === 'edit') dispatch({ type: 'update', habit: { ...h, id: modal.habit.id } })
            else dispatch({ type: 'add', habit: h })
            setModal(null)
          }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          body={confirm.body}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            confirm.run()
            setConfirm(null)
          }}
        />
      )}

      <Confetti burst={burst} petals={garden} />
      {queue[0] && <RewardPopup event={queue[0]} onDone={dismissPopup} />}
      <Floaters items={floaters} onDone={removeFloater} />
      <ProfileMenu />
      <InstallPopup />
      <AuthModal
        user={user}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />

      {toast && (
        <div className="toast fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/10 bg-panel px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
