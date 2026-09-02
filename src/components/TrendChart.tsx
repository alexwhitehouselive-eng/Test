import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DailyMetrics, MetricKey } from '../lib/types'
import { METRIC_CONFIG, METRIC_ORDER } from '../lib/metrics'
import { formatShortDate } from '../lib/utils'

const RANGES = [7, 14, 30, 90] as const

function ChartTooltip({
  active,
  payload,
  label,
  config,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
  config: (typeof METRIC_CONFIG)[MetricKey]
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-sm"
      style={{
        background: 'var(--surface-card)',
        borderColor: 'var(--border-hairline)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="mb-1" style={{ color: 'var(--text-muted)' }}>
        {label ? formatShortDate(label) : ''}
      </div>
      <div className="tabular flex items-center gap-1.5 font-semibold">
        <span className="h-2 w-2 rounded-full" style={{ background: config.color }} />
        {config.format(payload[0].value)} {config.unit}
      </div>
    </div>
  )
}

export function TrendChart({
  metricKey,
  onMetricChange,
  data,
  range,
  onRangeChange,
  goal,
}: {
  metricKey: MetricKey
  onMetricChange: (m: MetricKey) => void
  data: DailyMetrics[]
  range: number
  onRangeChange: (n: number) => void
  goal?: number
}) {
  const config = METRIC_CONFIG[metricKey]
  const sliced = data.slice(-range)

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Select metric">
          {METRIC_ORDER.map((key) => {
            const c = METRIC_CONFIG[key]
            const isActive = key === metricKey
            return (
              <button
                key={key}
                role="tab"
                aria-selected={isActive}
                onClick={() => onMetricChange(key)}
                className="rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                style={{
                  background: isActive ? c.color : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {c.label}
              </button>
            )
          })}
        </div>

        <div
          className="flex gap-0.5 rounded-full border p-0.5"
          style={{ borderColor: 'var(--border-hairline)' }}
          role="group"
          aria-label="Select date range"
        >
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
              style={{
                background: range === r ? 'var(--surface-2)' : 'transparent',
                color: range === r ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {r}D
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={sliced} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={config.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="var(--grid-hairline)"
            strokeDasharray="0"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={{ stroke: 'var(--axis-line)' }}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v) => config.format(v)}
          />
          <Tooltip content={<ChartTooltip config={config} />} cursor={{ stroke: 'var(--axis-line)' }} />
          {goal !== undefined && (
            <ReferenceLine
              y={goal}
              stroke="var(--text-muted)"
              strokeDasharray="4 4"
              label={{
                value: `Goal ${config.format(goal)}`,
                position: 'insideTopRight',
                fontSize: 10,
                fill: 'var(--text-muted)',
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey={metricKey}
            stroke={config.color}
            strokeWidth={2}
            fill="url(#trend-fill)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface-card)' }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
