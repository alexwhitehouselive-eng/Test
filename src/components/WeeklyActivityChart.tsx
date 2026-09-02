import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'
import type { DailyMetrics } from '../lib/types'
import { formatWeekday, todayISO } from '../lib/utils'

function ActivityTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
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
        {label ? formatWeekday(label) : ''}
      </div>
      <div className="tabular font-semibold">{Math.round(payload[0].value).toLocaleString()} steps</div>
    </div>
  )
}

export function WeeklyActivityChart({ data }: { data: DailyMetrics[] }) {
  const week = data.slice(-7)
  const today = todayISO()

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
    >
      <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        This week's steps
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={week} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
          <CartesianGrid stroke="var(--grid-hairline)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatWeekday}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={{ stroke: 'var(--axis-line)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={36}
            tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
          />
          <Tooltip content={<ActivityTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
          <Bar dataKey="steps" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
            {week.map((d) => (
              <Cell
                key={d.date}
                fill={d.date === today ? 'var(--color-steps)' : 'color-mix(in srgb, var(--color-steps) 55%, var(--surface-2))'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
