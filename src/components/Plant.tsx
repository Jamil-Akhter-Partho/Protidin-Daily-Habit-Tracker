import type { CSSProperties, ReactNode } from 'react'

/**
 * Growth stage for a day: 0 nothing, 1 seed, 2 sprout, 3 sapling, 4 young tree,
 * 5 full blossom tree (only when every habit is done).
 */
export function plantStage(done: number, total: number): number {
  if (!total || done <= 0) return 0
  if (done >= total) return 5
  return Math.max(1, Math.min(4, Math.ceil((done / total) * 4)))
}

const Puff = ({ cx, cy, r, shade, i }: { cx: number; cy: number; r: number; shade: 1 | 2 | 3 | 'hi'; i: number }) => (
  <circle className="puff" style={{ ['--i' as string]: i } as CSSProperties} cx={cx} cy={cy} r={r} fill={`var(--petal-${shade})`} />
)

const Leaf = ({ d }: { d: string }) => <path d={d} fill="var(--leaf)" />

function art(stage: number, sway: boolean): ReactNode {
  const canopy = `canopy ${sway ? 'sway' : ''}`
  switch (stage) {
    case 1:
      return (
        <>
          <ellipse cx="32" cy="74" rx="9" ry="3.5" fill="var(--soil)" />
          <path d="M32 73 C32 66 30 62 34 59 C38 56 41 60 38 63" fill="none" stroke="var(--leaf-2)" strokeWidth="3" strokeLinecap="round" />
        </>
      )
    case 2:
      return (
        <>
          <path d="M32 75 V56" stroke="var(--leaf-2)" strokeWidth="3" strokeLinecap="round" />
          <Leaf d="M32 62 C23 62 19 56 20 50 C28 50 32 55 32 62 Z" />
          <Leaf d="M32 58 C41 58 45 52 44 46 C36 46 32 51 32 58 Z" />
        </>
      )
    case 3:
      return (
        <>
          <path d="M32 75 V42" stroke="var(--trunk)" strokeWidth="3.5" strokeLinecap="round" />
          <Leaf d="M32 66 C24 66 21 61 22 56 C29 56 32 60 32 66 Z" />
          <Leaf d="M32 61 C40 61 43 56 42 51 C35 51 32 55 32 61 Z" />
          <g className={canopy}>
            <Puff cx={32} cy={36} r={10} shade={2} i={0} />
            <Puff cx={24} cy={40} r={7} shade={3} i={1} />
            <Puff cx={40} cy={40} r={7} shade={1} i={2} />
            <Puff cx={32} cy={29} r={7} shade={1} i={3} />
          </g>
        </>
      )
    case 4:
      return (
        <>
          <path d="M29.5 75 C31 63 30 55 31.5 45 L32.5 45 C34 55 33 63 34.5 75 Z" fill="var(--trunk)" />
          <g className={canopy}>
            <Puff cx={32} cy={32} r={15} shade={2} i={0} />
            <Puff cx={20} cy={38} r={10} shade={3} i={1} />
            <Puff cx={44} cy={38} r={10} shade={2} i={2} />
            <Puff cx={25} cy={24} r={10} shade={1} i={3} />
            <Puff cx={40} cy={24} r={10} shade={3} i={4} />
            <Puff cx={32} cy={39} r={8} shade={1} i={5} />
            <Puff cx={27} cy={22} r={2.6} shade="hi" i={6} />
            <Puff cx={41} cy={34} r={2.4} shade="hi" i={7} />
          </g>
        </>
      )
    case 5:
      return (
        <>
          <path d="M27.5 75 C30 63 29 55 31 44 L33 44 C35 55 34 63 36.5 75 Z" fill="var(--trunk)" />
          <path d="M31.5 54 C27 50 24 49 20 45 M32.5 51 C37 48 40 47 44 43" fill="none" stroke="var(--trunk)" strokeWidth="2.6" strokeLinecap="round" />
          <g className={canopy}>
            <Puff cx={32} cy={28} r={19} shade={2} i={0} />
            <Puff cx={16} cy={36} r={12} shade={3} i={1} />
            <Puff cx={48} cy={36} r={12} shade={3} i={2} />
            <Puff cx={21} cy={21} r={12} shade={1} i={3} />
            <Puff cx={43} cy={21} r={12} shade={2} i={4} />
            <Puff cx={32} cy={13} r={11} shade={1} i={5} />
            <Puff cx={25} cy={41} r={9} shade={1} i={6} />
            <Puff cx={40} cy={42} r={9} shade={2} i={7} />
            <Puff cx={23} cy={19} r={3} shade="hi" i={8} />
            <Puff cx={38} cy={14} r={2.6} shade="hi" i={9} />
            <Puff cx={46} cy={31} r={3} shade="hi" i={10} />
            <Puff cx={18} cy={35} r={2.6} shade="hi" i={11} />
            <Puff cx={32} cy={30} r={3} shade="hi" i={12} />
          </g>
          <path className="twinkle" d="M55 6 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 Z" fill="var(--gold)" />
          <path className="twinkle" style={{ animationDelay: '0.9s' }} d="M7 16 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 Z" fill="var(--gold)" />
        </>
      )
    default:
      return null
  }
}

/** A plant that grows with the day's progress. Re-plays its grow animation whenever the stage changes. */
export function Plant({
  stage,
  size = 36,
  sway = false,
  soil = false,
}: {
  stage: number
  size?: number
  sway?: boolean
  /** Always show a patch of soil, even before anything grows. */
  soil?: boolean
}) {
  if (stage === 0 && !soil) return null
  return (
    <svg className="plant" width={size} height={size * 1.25} viewBox="0 0 64 80" aria-hidden="true">
      {soil && <ellipse cx="32" cy="75.5" rx="15" ry="4" fill="var(--soil)" />}
      <g key={stage} className="plant-grow">
        {art(stage, sway)}
      </g>
    </svg>
  )
}
