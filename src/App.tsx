import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { StatCard } from './components/StatCard'
import { TrendChart } from './components/TrendChart'
import { WeeklyActivityChart } from './components/WeeklyActivityChart'
import { WorkoutTypeBreakdown } from './components/WorkoutTypeBreakdown'
import { WorkoutLog } from './components/WorkoutLog'
import { LogMetricsForm } from './components/LogMetricsForm'
import { GoalsPanel } from './components/GoalsPanel'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTheme } from './hooks/useTheme'
import { DEFAULT_GOALS, generateSeedMetrics, generateSeedWorkouts } from './lib/seed'
import type { DailyMetrics, Goals, MetricKey, Workout } from './lib/types'
import { METRIC_ORDER } from './lib/metrics'
import { todayISO } from './lib/utils'

export default function App() {
  const [theme, setTheme] = useTheme()

  const [metrics, setMetrics] = useLocalStorage<DailyMetrics[]>('vitals.metrics', () =>
    generateSeedMetrics(90),
  )
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>('vitals.workouts', () =>
    generateSeedWorkouts(metrics),
  )
  const [goals, setGoals] = useLocalStorage<Goals>('vitals.goals', () => DEFAULT_GOALS)

  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('steps')
  const [range, setRange] = useState(30)
  const [goalsOpen, setGoalsOpen] = useState(false)

  const today = metrics[metrics.length - 1]

  const subtitle = useMemo(() => {
    const d = new Date()
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
  }, [])

  function updateTodayMetrics(patch: Partial<DailyMetrics>) {
    setMetrics((prev) => {
      const iso = todayISO()
      const idx = prev.findIndex((m) => m.date === iso)
      if (idx === -1) {
        const base = prev[prev.length - 1]
        return [...prev, { ...base, ...patch, date: iso }]
      }
      const next = [...prev]
      next[idx] = { ...next[idx], ...patch }
      return next
    })
  }

  function addWorkout(w: Workout) {
    setWorkouts((prev) => [...prev, w])
  }

  function deleteWorkout(id: string) {
    setWorkouts((prev) => prev.filter((w) => w.id !== id))
  }

  const goalForMetric: Partial<Record<MetricKey, number>> = {
    steps: goals.steps,
    activeMinutes: goals.activeMinutes,
    caloriesBurned: goals.caloriesBurned,
    waterIntakeMl: goals.waterIntakeMl,
    sleepHours: goals.sleepHours,
  }

  return (
    <div className="mx-auto min-h-full max-w-6xl">
      <Header
        theme={theme}
        onThemeChange={setTheme}
        onEditGoals={() => setGoalsOpen(true)}
        subtitle={subtitle}
      />

      <main className="flex flex-col gap-4 px-4 pb-16 sm:px-6">
        <section
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          aria-label="Today's key metrics"
        >
          {METRIC_ORDER.map((key) => (
            <StatCard
              key={key}
              metricKey={key}
              history={metrics}
              goal={goalForMetric[key]}
              active={key === selectedMetric}
              onClick={() => setSelectedMetric(key)}
            />
          ))}
        </section>

        <TrendChart
          metricKey={selectedMetric}
          onMetricChange={setSelectedMetric}
          data={metrics}
          range={range}
          onRangeChange={setRange}
          goal={goalForMetric[selectedMetric]}
        />

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WeeklyActivityChart data={metrics} />
          <WorkoutTypeBreakdown workouts={workouts} />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {today && <LogMetricsForm key={today.date} today={today} onSave={updateTodayMetrics} />}
          <WorkoutLog workouts={workouts} onAdd={addWorkout} onDelete={deleteWorkout} />
        </section>
      </main>

      {goalsOpen && (
        <GoalsPanel goals={goals} onSave={setGoals} onClose={() => setGoalsOpen(false)} />
      )}
    </div>
  )
}
