import type { DailyMetrics, MetricKey } from '../lib/types'
import { METRIC_CONFIG } from '../lib/metrics'
import { percentChange } from '../lib/utils'
import { GoalMeter } from './GoalMeter'
import { Sparkline } from './Sparkline'

export function StatCard({
  metricKey,
  history,
  goal,
  onClick,
  active,
}: {
  metricKey: MetricKey
  history: DailyMetrics[]
  goal?: number
  onClick?: () => void
  active?: boolean
}) {
  const config = METRIC_CONFIG[metricKey]
  const today = history[history.length - 1]
  const yesterday = history[history.length - 2]
  const value = today?.[metricKey] ?? 0
  const prevValue = yesterday?.[metricKey]
  const delta = prevValue !== undefined ? percentChange(value, prevValue) : null

  // for weight, down is "good"; for everything else, up is "good"
  const upIsGood = metricKey !== 'weightKg'
  const deltaIsGood = delta === null ? null : upIsGood ? delta >= 0 : delta <= 0

  const spark = history.slice(-14).map((m) => ({ value: m[metricKey] }))

  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-2 rounded-xl border p-4 text-left transition-colors"
      style={{
        background: 'var(--surface-card)',
        borderColor: active ? config.color : 'var(--border-hairline)',
        boxShadow: active ? `0 0 0 1px ${config.color}` : 'none',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          {config.label}
        </span>
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: config.color }}
          aria-hidden
        />
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="tabular text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {config.format(value)}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {config.unit}
        </span>
      </div>

      {delta !== null && (
        <span
          className="tabular text-[11px] font-medium"
          style={{ color: deltaIsGood ? 'var(--delta-good)' : 'var(--delta-bad)' }}
        >
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}% vs yesterday
        </span>
      )}

      <div className="-mx-1">
        <Sparkline data={spark} color={config.color} id={metricKey} />
      </div>

      {goal !== undefined && <GoalMeter value={value} goal={goal} color={config.color} />}
    </button>
  )
}
