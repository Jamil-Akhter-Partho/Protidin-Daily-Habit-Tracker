import { useEffect, useRef } from 'react'
import { Award, PartyPopper, TrendingUp } from 'lucide-react'
import { prefersReducedMotion } from '../lib/hooks'
import { BADGE_ICONS } from './Rewards'

export interface CelebrationEvent {
  id: number
  kind: 'level' | 'badge' | 'perfect'
  title: string
  subtitle: string
  badgeId?: string
}

export interface Floater {
  id: number
  x: number
  y: number
  text: string
}

const COLORS = ['#eda01b', '#3b82f6', '#f0486a', '#12a97a', '#8b5cf6', '#ffffff']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  rot: number
  vr: number
  life: number
  c: string
}

/** Garden style: petals drift down from the top in the current bloom colours. */
function rainPetals(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const css = getComputedStyle(document.documentElement)
  const colors = ['--petal-1', '--petal-2', '--petal-3', '--petal-hi']
    .map((v) => css.getPropertyValue(v).trim())
    .filter(Boolean)
  if (!colors.length) colors.push('#f5b5cf', '#ee8fb5', '#e0669a')

  const petals = Array.from({ length: Math.round(Math.min(170, W / 9)) }, () => ({
    x: Math.random() * W,
    y: -20 - Math.random() * H * 0.5,
    vy: 2.4 + Math.random() * 2.6,
    drift: 0.6 + Math.random() * 1.4,
    phase: Math.random() * Math.PI * 2,
    size: 6 + Math.random() * 7,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.08,
    c: colors[(Math.random() * colors.length) | 0],
  }))

  let raf = 0
  let t = 0
  const step = () => {
    ctx.clearRect(0, 0, W, H)
    t += 0.03
    let alive = 0
    for (const p of petals) {
      if (p.y > H + 20) continue
      alive++
      p.y += p.vy
      p.x += Math.sin(t + p.phase) * p.drift
      p.rot += p.vr
      if (p.y < -12) continue
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = Math.min(1, (H - p.y) / 160 + 0.25)
      ctx.fillStyle = p.c
      ctx.beginPath()
      ctx.ellipse(0, 0, p.size, p.size * 0.55 * (0.55 + 0.45 * Math.abs(Math.cos(t * 1.5 + p.phase))), 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
    if (alive) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
  return () => {
    cancelAnimationFrame(raf)
    ctx.clearRect(0, 0, W, H)
  }
}

/** Fires a burst from both bottom corners every time `burst` changes. */
export function Confetti({ burst, petals = false }: { burst: number; petals?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!burst || !canvas || prefersReducedMotion()) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    if (petals) return rainPetals(ctx, W, H)

    const scale = Math.max(0.7, Math.min(1.5, W / 1400))
    const parts: Particle[] = []
    const spawn = (x: number, angle: number) => {
      for (let i = 0; i < 110; i++) {
        const a = angle + (Math.random() - 0.5) * 0.9
        const speed = (11 + Math.random() * 15) * scale
        parts.push({
          x,
          y: H * 0.82,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          w: 6 + Math.random() * 6,
          h: 8 + Math.random() * 8,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.4,
          life: 110 + Math.random() * 60,
          c: COLORS[(Math.random() * COLORS.length) | 0],
        })
      }
    }
    spawn(0, -Math.PI / 3)
    spawn(W, (-2 * Math.PI) / 3)

    let raf = 0
    const step = () => {
      ctx.clearRect(0, 0, W, H)
      let alive = 0
      for (const p of parts) {
        if (p.life <= 0 || p.y > H + 30) continue
        alive++
        p.vy += 0.3
        p.vx *= 0.99
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        p.life--
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.min(1, p.life / 30)
        ctx.fillStyle = p.c
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 1.7)) + 1)
        ctx.restore()
      }
      if (alive) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      ctx.clearRect(0, 0, W, H)
    }
    // `petals` is read when a burst fires; switching style alone should not replay it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burst])

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-50 h-full w-full" aria-hidden="true" />
}

export function RewardPopup({ event, onDone }: { event: CelebrationEvent; onDone: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 3200)
    return () => window.clearTimeout(id)
  }, [event.id, onDone])

  const Icon =
    event.kind === 'level' ? TrendingUp : event.kind === 'perfect' ? PartyPopper : ((event.badgeId && BADGE_ICONS[event.badgeId]) || Award)
  const label = event.kind === 'level' ? 'Level up' : event.kind === 'perfect' ? 'Perfect day' : 'Badge unlocked'

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[18vh] z-50 flex justify-center px-4" role="status" aria-live="polite">
      <button
        key={event.id}
        onClick={onDone}
        className="popup pointer-events-auto flex items-center gap-4 rounded-3xl border border-white/10 bg-panel py-4 pl-4 pr-7 text-left text-white"
        style={{ boxShadow: 'var(--shadow-pop)' }}
      >
        <span className="relative grid size-16 shrink-0 place-items-center">
          <span
            className="popup-glow absolute inset-0 rounded-full"
            style={{ background: 'conic-gradient(var(--w1), var(--w3), var(--w5), var(--w2), var(--w4), var(--w1))' }}
          />
          <span className="relative grid size-[54px] place-items-center rounded-full bg-panel text-gold">
            <Icon size={26} />
          </span>
        </span>
        <span>
          <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-gold">{label}</span>
          <span className="block font-display text-[24px] font-extrabold leading-tight">{event.title}</span>
          <span className="block text-[13px] opacity-75">{event.subtitle}</span>
        </span>
      </button>
    </div>
  )
}

export function Floaters({ items, onDone }: { items: Floater[]; onDone: (id: number) => void }) {
  return (
    <>
      {items.map((f) => (
        <span key={f.id} className="floater num" style={{ left: f.x, top: f.y }} onAnimationEnd={() => onDone(f.id)} aria-hidden="true">
          {f.text}
        </span>
      ))}
    </>
  )
}
