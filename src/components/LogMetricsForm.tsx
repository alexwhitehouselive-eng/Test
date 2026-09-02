import { useState } from 'react'
import type { DailyMetrics } from '../lib/types'

interface FieldDef {
  key: keyof Omit<DailyMetrics, 'date'>
  label: string
  step?: number
  suffix: string
}

const FIELDS: FieldDef[] = [
  { key: 'steps', label: 'Steps', suffix: 'steps' },
  { key: 'sleepHours', label: 'Sleep', step: 0.1, suffix: 'hrs' },
  { key: 'waterIntakeMl', label: 'Water', suffix: 'mL' },
  { key: 'restingHeartRate', label: 'Resting HR', suffix: 'bpm' },
  { key: 'weightKg', label: 'Weight', step: 0.1, suffix: 'kg' },
]

export function LogMetricsForm({
  today,
  onSave,
}: {
  today: DailyMetrics
  onSave: (patch: Partial<DailyMetrics>) => void
}) {
  const [draft, setDraft] = useState<DailyMetrics>(today)
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
    >
      <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Log today's numbers
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {f.label} <span style={{ color: 'var(--text-muted)' }}>({f.suffix})</span>
            <input
              type="number"
              step={f.step ?? 1}
              min={0}
              value={draft[f.key]}
              onChange={(e) => setDraft((d) => ({ ...d, [f.key]: Number(e.target.value) }))}
              className="tabular rounded-lg border px-2 py-1.5 text-sm"
              style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
            />
          </label>
        ))}
        <button
          type="submit"
          className="col-span-2 self-end rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:col-span-5"
          style={{ background: saved ? 'var(--status-good)' : 'var(--color-steps)' }}
        >
          {saved ? 'Saved ✓' : 'Save today'}
        </button>
      </form>
    </div>
  )
}
