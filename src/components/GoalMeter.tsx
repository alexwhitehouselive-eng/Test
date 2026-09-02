import { clamp } from '../lib/utils'

export function GoalMeter({
  value,
  goal,
  color,
}: {
  value: number
  goal: number
  color: string
}) {
  const pct = goal > 0 ? clamp((value / goal) * 100, 0, 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full"
        style={{ background: 'color-mix(in srgb, ' + color + ' 18%, var(--grid-hairline))' }}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="tabular text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
        {Math.round(pct)}%
      </span>
    </div>
  )
}
