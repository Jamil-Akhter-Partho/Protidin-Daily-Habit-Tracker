import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'

export interface UserProfile {
  name: string
  avatar: string
}

interface Position {
  x: number
  y: number
}

const STORAGE_KEY = 'protidin:profile'
const POS_KEY = 'protidin:profile:pos'

const DEFAULT_PROFILE: UserProfile = {
  name: 'User',
  avatar: '👤',
}

const AVATAR_OPTIONS = ['👤', '🌸', '🌿', '⚡', '🌙', '⭐', '🔥', '🎯']

function loadProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PROFILE
    const parsed = JSON.parse(raw)
    return {
      name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : DEFAULT_PROFILE.name,
      avatar: typeof parsed.avatar === 'string' && parsed.avatar.trim() ? parsed.avatar.trim() : DEFAULT_PROFILE.avatar,
    }
  } catch {
    return DEFAULT_PROFILE
  }
}

function getInitialPosition(): Position {
  if (typeof window === 'undefined') return { x: 24, y: 500 }
  try {
    const raw = localStorage.getItem(POS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        return clampPosition(parsed.x, parsed.y)
      }
    }
  } catch {
    // fallback
  }
  // Default to bottom-left corner
  return { x: 24, y: Math.max(20, window.innerHeight - 64) }
}

function clampPosition(x: number, y: number, width = 120, height = 36): Position {
  if (typeof window === 'undefined') return { x, y }
  const maxX = Math.max(12, window.innerWidth - width - 12)
  const maxY = Math.max(12, window.innerHeight - height - 12)
  return {
    x: Math.min(Math.max(12, x), maxX),
    y: Math.min(Math.max(12, y), maxY),
  }
}

export function ProfileMenu() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [pos, setPos] = useState<Position>(getInitialPosition)
  const [open, setOpen] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftAvatar, setDraftAvatar] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const wrapRef = useRef<HTMLDivElement>(null)
  const isMovedRef = useRef(false)
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; posX: number; posY: number }>({
    pointerX: 0,
    pointerY: 0,
    posX: 0,
    posY: 0,
  })

  useEffect(() => {
    setProfile(loadProfile())
    setPos(getInitialPosition())

    const onResize = () => {
      setPos((prev) => clampPosition(prev.x, prev.y))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!open) return

    setDraftName(profile.name)
    setDraftAvatar(profile.avatar)

    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, profile])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with primary mouse button / touch
    if (e.button !== 0) return
    // Don't drag if clicking inside dialog
    const target = e.target as HTMLElement
    if (target.closest('[role="dialog"]')) return

    isMovedRef.current = false
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      posX: pos.x,
      posY: pos.y,
    }

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - dragStartRef.current.pointerX
      const dy = moveEvent.clientY - dragStartRef.current.pointerY

      if (!isMovedRef.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        isMovedRef.current = true
        setIsDragging(true)
        setOpen(false)
      }

      if (isMovedRef.current) {
        const capsuleW = wrapRef.current?.offsetWidth || 160
        const capsuleH = wrapRef.current?.offsetHeight || 44
        const next = clampPosition(
          dragStartRef.current.posX + dx,
          dragStartRef.current.posY + dy,
          capsuleW,
          capsuleH
        )
        setPos(next)
      }
    }

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)

      if (isMovedRef.current) {
        setIsDragging(false)
        setPos((current) => {
          try {
            localStorage.setItem(POS_KEY, JSON.stringify(current))
          } catch {
            // ignore storage quota errors
          }
          return current
        })
      } else {
        // Plain click without drag -> Toggle dialog
        setOpen((o) => !o)
      }
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const next: UserProfile = {
      name: draftName.trim() || 'User',
      avatar: draftAvatar || '👤',
    }
    setProfile(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
    setOpen(false)
  }

  const initialLetter = (profile.name.trim() ? profile.name.trim()[0] : 'U').toUpperCase()

  // Smart placement for popup relative to screen center
  const isBottomHalf = typeof window !== 'undefined' ? pos.y > window.innerHeight / 2 : true
  const isRightHalf = typeof window !== 'undefined' ? pos.x > window.innerWidth - 320 : false

  return (
    <div
      ref={wrapRef}
      onPointerDown={handlePointerDown}
      className="fixed z-50 select-none touch-none"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      }}
    >
      {/* Liquid Glass Capsule */}
      <div
        className={`group flex items-center gap-2 rounded-full px-2.5 py-1 transition-transform duration-150 ${
          isDragging ? 'cursor-grabbing scale-95' : 'cursor-grab hover:scale-[1.03]'
        }`}
        style={{
          backdropFilter: 'blur(20px) saturate(190%)',
          WebkitBackdropFilter: 'blur(20px) saturate(190%)',
          background: 'color-mix(in srgb, var(--surface) 62%, transparent)',
          border: '1px solid color-mix(in srgb, var(--line) 75%, rgba(255,255,255,0.45))',
          boxShadow: `
            0 10px 28px -4px rgba(0, 0, 0, 0.28),
            0 3px 10px -2px rgba(0, 0, 0, 0.15),
            inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.45),
            inset 0 -1px 1px 0 rgba(0, 0, 0, 0.2)
          `,
        }}
        title="মাউস চেপে ধরে যেকোনো জায়গায় ড্র্যাগ করুন • ক্লিক করে প্রোফাইল এডিট করুন"
      >
        {/* Avatar Display */}
        <div
          className="grid size-6 place-items-center rounded-full text-xs font-bold text-ink shadow-inner overflow-hidden select-none"
          style={{
            background: 'color-mix(in srgb, var(--surface-2) 75%, transparent)',
            border: '1px solid color-mix(in srgb, var(--line) 80%, rgba(255,255,255,0.3))',
          }}
        >
          {profile.avatar === 'initial' ? (
            <span className="font-extrabold text-[11px] text-accent">{initialLetter}</span>
          ) : (
            <span className="text-[12.5px]">{profile.avatar}</span>
          )}
        </div>

        {/* User Name */}
        <div className="leading-tight pr-1">
          <div className="text-[12px] font-bold text-ink max-w-[120px] truncate drop-shadow-2xs">
            {profile.name}
          </div>
        </div>
      </div>

      {/* Upward / Downward Liquid Glass Dialog */}
      {open && (
        <div
          role="dialog"
          aria-label="Edit Profile"
          className={`menu-pop absolute z-50 w-[300px] space-y-4 rounded-3xl p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
            isBottomHalf ? 'bottom-[46px]' : 'top-[46px]'
          } ${isRightHalf ? 'right-0' : 'left-0'}`}
          style={{
            backdropFilter: 'blur(24px) saturate(200%)',
            WebkitBackdropFilter: 'blur(24px) saturate(200%)',
            background: 'color-mix(in srgb, var(--surface) 86%, transparent)',
            border: '1px solid color-mix(in srgb, var(--line) 75%, rgba(255,255,255,0.4))',
            boxShadow: 'var(--shadow-pop)',
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2.5">
              <div className="grid size-10 place-items-center rounded-2xl bg-surface-2 border border-line text-lg select-none">
                {draftAvatar === 'initial' ? (
                  <span className="font-extrabold text-base text-accent">
                    {(draftName.trim() ? draftName.trim()[0] : 'U').toUpperCase()}
                  </span>
                ) : (
                  <span>{draftAvatar}</span>
                )}
              </div>
              <div>
                <h3 className="text-[14px] font-extrabold text-ink leading-tight">
                  {draftName.trim() || 'User'}
                </h3>
                <p className="text-[11px] text-ink-3">Draggable Profile</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="icon-btn !h-7 !w-7"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <label
                htmlFor="profile-name-input"
                className="block px-0.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-ink-3"
              >
                Your Name
              </label>
              <input
                id="profile-name-input"
                type="text"
                value={draftName}
                maxLength={30}
                placeholder="Enter your name..."
                onChange={(e) => setDraftName(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-line bg-surface-2/80 px-3 py-2 text-[13px] font-semibold text-ink placeholder:text-ink-3/60 outline-none transition focus:border-accent"
              />
            </div>

            <div>
              <label className="block px-0.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-ink-3">
                Avatar
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setDraftAvatar('initial')}
                  className={`grid size-8 place-items-center rounded-xl border text-[11.5px] font-black transition ${
                    draftAvatar === 'initial'
                      ? 'border-accent bg-accent text-on-accent'
                      : 'border-line bg-surface-2 text-ink hover:border-ink-3'
                  }`}
                  title="Use initial letter"
                >
                  {(draftName.trim() ? draftName.trim()[0] : 'A').toUpperCase()}
                </button>
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setDraftAvatar(av)}
                    className={`grid size-8 place-items-center rounded-xl border text-[14px] transition ${
                      draftAvatar === av
                        ? 'border-accent bg-accent/15 ring-2 ring-accent'
                        : 'border-line bg-surface-2 hover:border-ink-3'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-line">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn !h-8 !px-3 !text-[12.5px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary !h-8 !px-4 !text-[12.5px]"
              >
                <Check size={14} /> Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
