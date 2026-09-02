import type { ThemeChoice } from '../hooks/useTheme'

const THEME_OPTIONS: { value: ThemeChoice; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀' },
  { value: 'system', label: 'System', icon: '◐' },
  { value: 'dark', label: 'Dark', icon: '☾' },
]

export function Header({
  theme,
  onThemeChange,
  onEditGoals,
  subtitle,
}: {
  theme: ThemeChoice
  onThemeChange: (t: ThemeChoice) => void
  onEditGoals: () => void
  subtitle: string
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Vitals
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onEditGoals}
          className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
          style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-secondary)' }}
        >
          Edit goals
        </button>

        <div
          className="flex gap-0.5 rounded-full border p-0.5"
          style={{ borderColor: 'var(--border-hairline)' }}
          role="group"
          aria-label="Theme"
        >
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onThemeChange(opt.value)}
              aria-label={opt.label}
              aria-pressed={theme === opt.value}
              title={opt.label}
              className="rounded-full px-2.5 py-1 text-sm transition-colors"
              style={{
                background: theme === opt.value ? 'var(--surface-2)' : 'transparent',
                color: theme === opt.value ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
