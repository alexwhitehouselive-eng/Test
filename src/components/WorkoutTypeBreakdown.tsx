import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Workout } from '../lib/types'
import { WORKOUT_TYPE_COLOR, WORKOUT_TYPE_ORDER } from '../lib/workoutColors'

function BreakdownTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: { type: string; calories: number; sessions: number } }[]
}) {
  if (!active || !payload || payload.length === 0) return null
  const p = payload[0].payload
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-sm"
      style={{
        background: 'var(--surface-card)',
        borderColor: 'var(--border-hairline)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="mb-1 font-semibold">{p.type}</div>
      <div style={{ color: 'var(--text-secondary)' }} className="tabular">
        {p.sessions} session{p.sessions === 1 ? '' : 's'} · {p.calories.toLocaleString()} kcal
      </div>
    </div>
  )
}

export function WorkoutTypeBreakdown({ workouts }: { workouts: Workout[] }) {
  const byType = WORKOUT_TYPE_ORDER.map((type) => {
    const items = workouts.filter((w) => w.type === type)
    return {
      type,
      calories: items.reduce((sum, w) => sum + w.caloriesBurned, 0),
      sessions: items.length,
    }
  }).filter((d) => d.sessions > 0)

  if (byType.length === 0) {
    return (
      <div
        className="rounded-xl border p-4 text-sm"
        style={{
          background: 'var(--surface-card)',
          borderColor: 'var(--border-hairline)',
          color: 'var(--text-muted)',
        }}
      >
        Log a workout to see your breakdown by type.
      </div>
    )
  }

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
    >
      <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Calories by workout type
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={byType} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--grid-hairline)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="type"
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip content={<BreakdownTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
          <Bar dataKey="calories" radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false}>
            {byType.map((d) => (
              <Cell key={d.type} fill={WORKOUT_TYPE_COLOR[d.type]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
