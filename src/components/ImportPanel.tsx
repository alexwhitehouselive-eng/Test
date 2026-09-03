import { useRef, useState } from 'react'
import { importAppleHealthExport } from '../lib/appleHealthImport'
import { downloadCsvTemplate, importCsv } from '../lib/csvImport'
import type { MetricUpdate } from '../lib/mergeMetrics'
import type { Workout } from '../lib/types'

type Tab = 'csv' | 'apple'

interface ImportSummary {
  days: number
  workouts: number
  warnings: string[]
}

export function ImportPanel({
  onImport,
  onClose,
}: {
  onImport: (updates: MetricUpdate[], workouts: Workout[]) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<Tab>('apple')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setBusy(true)
    setError(null)
    setSummary(null)
    setProgress(0)
    try {
      if (tab === 'apple') {
        const result = await importAppleHealthExport(file, (read, total) =>
          setProgress(total > 0 ? read / total : null),
        )
        onImport(result.updates, result.workouts)
        setSummary({ days: result.updates.length, workouts: result.workouts.length, warnings: result.warnings })
      } else {
        const result = await importCsv(file)
        onImport(result.updates, [])
        setSummary({ days: result.updates.length, workouts: 0, warnings: result.warnings })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read that file.')
    } finally {
      setBusy(false)
      setProgress(null)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Import data"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border p-5 shadow-xl"
        style={{ background: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Import your data
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-sm" style={{ color: 'var(--text-muted)' }}>
            ✕
          </button>
        </div>

        <div
          className="mb-4 flex gap-0.5 rounded-full border p-0.5"
          style={{ borderColor: 'var(--border-hairline)' }}
          role="group"
          aria-label="Import source"
        >
          {(
            [
              ['apple', 'Apple Health export'],
              ['csv', 'CSV / spreadsheet'],
            ] as [Tab, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setTab(value)
                setSummary(null)
                setError(null)
              }}
              className="flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: tab === value ? 'var(--surface-2)' : 'transparent',
                color: tab === value ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'apple' ? (
          <p className="mb-3 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            On your iPhone: Health app → your profile icon → <strong>Export All Health Data</strong>. AirDrop or
            save the zip, unzip it, and pick the <code>export.xml</code> file inside. It can be large — this
            reads it in chunks in your browser and nothing is uploaded anywhere. Steps, exercise minutes, active
            calories, water, sleep, resting heart rate, weight, and workouts are picked up.
          </p>
        ) : (
          <div className="mb-3 flex items-start justify-between gap-3 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <p>
              A CSV with a <code>date</code> column plus any of: steps, activeMinutes, caloriesBurned,
              waterIntakeMl, sleepHours, restingHeartRate, weightKg. Works well for a Fitbit/Garmin/Google Fit
              export you've reshaped, or your own spreadsheet.
            </p>
            <button
              onClick={downloadCsvTemplate}
              className="shrink-0 whitespace-nowrap rounded-lg border px-2 py-1 text-[11px] font-medium"
              style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-secondary)' }}
            >
              Get template
            </button>
          </div>
        )}

        <label
          className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-8 text-center text-sm transition-colors"
          style={{ borderColor: 'var(--axis-line)', color: 'var(--text-muted)' }}
        >
          <input
            ref={fileInput}
            type="file"
            accept={tab === 'apple' ? '.xml' : '.csv'}
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
          <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
            {busy
              ? progress !== null
                ? `Reading file… ${Math.round(progress * 100)}%`
                : 'Reading file…'
              : `Choose ${tab === 'apple' ? 'export.xml' : 'a .csv file'}`}
          </span>
          <span>{busy ? 'A multi-year export can take a minute or two — keep this tab open' : 'or drag it here'}</span>
        </label>

        {progress !== null && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--grid-hairline)' }}>
            <div
              className="h-full rounded-full transition-[width]"
              style={{ width: `${Math.round(progress * 100)}%`, background: 'var(--color-steps)' }}
            />
          </div>
        )}

        {error && (
          <p className="mt-3 text-xs font-medium" style={{ color: 'var(--delta-bad)' }}>
            {error}
          </p>
        )}

        {summary && (
          <div className="mt-3 rounded-lg px-3 py-2 text-xs" style={{ background: 'var(--surface-1)' }}>
            <p className="font-medium" style={{ color: 'var(--status-good)' }}>
              Imported {summary.days} day{summary.days === 1 ? '' : 's'}
              {summary.workouts > 0 ? ` and ${summary.workouts} workout${summary.workouts === 1 ? '' : 's'}` : ''}.
            </p>
            {summary.warnings.slice(0, 4).map((w, i) => (
              <p key={i} style={{ color: 'var(--text-muted)' }}>
                {w}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
