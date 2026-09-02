import { useState } from 'react'
import type { Goals } from '../lib/types'

const FIELDS: { key: keyof Goals; label: string; suffix: string; step?: number }[] = [
  { key: 'steps', label: 'Daily steps', suffix: 'steps' },
  { key: 'activeMinutes', label: 'Active minutes', suffix: 'min' },
  { key: 'caloriesBurned', label: 'Calories burned', suffix: 'kcal' },
  { key: 'waterIntakeMl', label: 'Water intake', suffix: 'mL' },
  { key: 'sleepHours', label: 'Sleep', suffix: 'hrs', step: 0.5 },
  { key: 'weightKg', label: 'Target weight', suffix: 'kg', step: 0.1 },
]

export function GoalsPanel({
  goals,
  onSave,
  onClose,
}: {
  goals: Goals
  onSave: (g: Goals) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<Goals>(goals)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(draft)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit goals"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-5 shadow-xl"
        style={{ background: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Edit goals
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {FIELDS.map((f) => (
            <label key={f.key} className="flex items-center justify-between gap-3 text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  step={f.step ?? 1}
                  value={draft[f.key]}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: Number(e.target.value) }))}
                  className="tabular w-24 rounded-lg border px-2 py-1.5 text-right text-sm"
                  style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
                />
                <span className="w-9 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {f.suffix}
                </span>
              </div>
            </label>
          ))}

          <button
            type="submit"
            className="mt-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-steps)' }}
          >
            Save goals
          </button>
        </form>
      </div>
    </div>
  )
}
