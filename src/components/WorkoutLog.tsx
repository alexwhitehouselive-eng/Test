import { useState } from 'react'
import type { Workout, WorkoutType } from '../lib/types'
import { WORKOUT_TYPE_COLOR, WORKOUT_TYPE_ORDER } from '../lib/workoutColors'
import { formatShortDate, todayISO, uid } from '../lib/utils'

export function WorkoutLog({
  workouts,
  onAdd,
  onDelete,
}: {
  workouts: Workout[]
  onAdd: (w: Workout) => void
  onDelete: (id: string) => void
}) {
  const [type, setType] = useState<WorkoutType>('Run')
  const [duration, setDuration] = useState(30)
  const [calories, setCalories] = useState(250)
  const [date, setDate] = useState(todayISO())

  const recent = [...workouts].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (duration <= 0) return
    onAdd({ id: uid(), date, type, durationMin: duration, caloriesBurned: calories })
    setDuration(30)
    setCalories(250)
  }

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
    >
      <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Log a workout
      </h3>

      <form onSubmit={handleSubmit} className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value as WorkoutType)}
            className="rounded-lg border px-2 py-1.5 text-sm"
            style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
          >
            {WORKOUT_TYPE_ORDER.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Date
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="tabular rounded-lg border px-2 py-1.5 text-sm"
            style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
          />
        </label>

        <label className="flex flex-col gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Duration (min)
          <input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="tabular rounded-lg border px-2 py-1.5 text-sm"
            style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
          />
        </label>

        <label className="flex flex-col gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Calories
          <input
            type="number"
            min={0}
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
            className="tabular rounded-lg border px-2 py-1.5 text-sm"
            style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
          />
        </label>

        <button
          type="submit"
          className="col-span-2 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:col-span-4"
          style={{ background: 'var(--color-steps)' }}
        >
          Add workout
        </button>
      </form>

      <div className="scrollbar-thin flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 260 }}>
        {recent.length === 0 && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            No workouts logged yet.
          </p>
        )}
        {recent.map((w) => (
          <div
            key={w.id}
            className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm"
            style={{ background: 'var(--surface-1)' }}
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: WORKOUT_TYPE_COLOR[w.type] }}
                aria-hidden
              />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {w.type}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>{formatShortDate(w.date)}</span>
            </div>
            <div className="tabular flex shrink-0 items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
              <span>{w.durationMin} min</span>
              <span>{w.caloriesBurned} kcal</span>
              <button
                onClick={() => onDelete(w.id)}
                aria-label={`Delete ${w.type} workout on ${w.date}`}
                className="text-xs transition-colors hover:opacity-100"
                style={{ color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
