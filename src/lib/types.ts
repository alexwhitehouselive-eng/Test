export interface DailyMetrics {
  /** ISO date string, e.g. 2026-08-30 */
  date: string
  steps: number
  activeMinutes: number
  caloriesBurned: number
  waterIntakeMl: number
  sleepHours: number
  restingHeartRate: number
  weightKg: number
}

export type WorkoutType =
  | 'Run'
  | 'Walk'
  | 'Cycling'
  | 'Strength'
  | 'Swim'
  | 'Yoga'
  | 'HIIT'
  | 'Other'

export interface Workout {
  id: string
  date: string
  type: WorkoutType
  durationMin: number
  caloriesBurned: number
  notes?: string
}

export interface Goals {
  steps: number
  activeMinutes: number
  caloriesBurned: number
  waterIntakeMl: number
  sleepHours: number
  weightKg: number
}

export type MetricKey = keyof Omit<DailyMetrics, 'date'>

export interface MetricConfig {
  key: MetricKey
  label: string
  unit: string
  color: string
  format: (v: number) => string
}
