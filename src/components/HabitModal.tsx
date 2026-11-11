import { useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import type { Habit } from '../lib/store'
import { Modal } from './Modal'

const EMOJIS = [
  '💧', '🏃', '📚', '🧘', '😴', '🍎', '💪', '🚶', '✍️', '🎯', '🧹', '🥗',
  '🌅', '📵', '🙏', '🦷', '💻', '🧠', '💊', '🎸', '💰', '☕', '🌱', '🚭',
]

export function HabitModal({
  habit,
  daysThisMonth,
  onSave,
  onDelete,
  onClose,
}: {
  habit: Habit | null
  daysThisMonth: number
  onSave: (h: Omit<Habit, 'id'>) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [name, setName] = useState(habit?.name ?? '')
  const [emoji, setEmoji] = useState(habit?.emoji ?? EMOJIS[0])
  const [daily, setDaily] = useState(habit ? habit.goal == null : true)
  const [goal, setGoal] = useState(String(habit?.goal ?? 20))

  const goalNum = Math.round(Number(goal))
  const goalValid = daily || (Number.isFinite(goalNum) && goalNum >= 1 && goalNum <= 31)
  const valid = name.trim().length > 0 && goalValid

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid) return
    onSave({ name: name.trim(), emoji, goal: daily ? null : goalNum })
  }

  return (
    <Modal title={habit ? 'Edit habit' : 'New habit'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Name</span>
          <input
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Walk 5,000 steps"
            maxLength={60}
            autoFocus
          />
        </label>

        <div>
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Icon</span>
          <div className="grid grid-cols-12 gap-1">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                aria-label={`Icon ${e}`}
                aria-pressed={emoji === e}
                className={`grid aspect-square place-items-center rounded-lg text-[17px] transition ${
                  emoji === e ? 'bg-accent shadow-md scale-110' : 'hover:bg-surface-2'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Monthly goal</span>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-surface-2 p-1">
              {[
                { label: 'Every day', value: true },
                { label: 'Custom', value: false },
              ].map((o) => (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => setDaily(o.value)}
                  aria-pressed={daily === o.value}
                  className={`h-8 rounded-lg px-3 text-[13px] font-semibold transition ${
                    daily === o.value ? 'bg-surface shadow-sm' : 'text-ink-2'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {!daily && (
              <label className="flex items-center gap-2 text-[13px] text-ink-2">
                <input
                  className="field num !h-10 !w-20 text-center"
                  type="number"
                  min={1}
                  max={31}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  aria-label="Goal in days per month"
                />
                days a month
              </label>
            )}
          </div>
          <p className="mt-2 text-[12.5px] text-ink-3">
            {daily
              ? `Counts every day of the month (${daysThisMonth} this month).`
              : goalValid
                ? 'Shorter months use the number of days they have.'
                : 'Enter a number from 1 to 31.'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          {onDelete ? (
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              <Trash2 size={16} /> Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!valid} style={{ opacity: valid ? 1 : 0.5 }}>
              {habit ? 'Save changes' : 'Add habit'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
