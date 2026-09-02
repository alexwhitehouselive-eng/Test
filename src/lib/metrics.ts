import type { MetricConfig, MetricKey } from './types'

export const METRIC_CONFIG: Record<MetricKey, MetricConfig> = {
  steps: {
    key: 'steps',
    label: 'Steps',
    unit: 'steps',
    color: 'var(--color-steps)',
    format: (v) => Math.round(v).toLocaleString(),
  },
  activeMinutes: {
    key: 'activeMinutes',
    label: 'Active Minutes',
    unit: 'min',
    color: 'var(--color-active)',
    format: (v) => `${Math.round(v)}`,
  },
  caloriesBurned: {
    key: 'caloriesBurned',
    label: 'Calories Burned',
    unit: 'kcal',
    color: 'var(--color-calories)',
    format: (v) => Math.round(v).toLocaleString(),
  },
  waterIntakeMl: {
    key: 'waterIntakeMl',
    label: 'Water Intake',
    unit: 'L',
    color: 'var(--color-water)',
    format: (v) => (v / 1000).toFixed(1),
  },
  sleepHours: {
    key: 'sleepHours',
    label: 'Sleep',
    unit: 'hrs',
    color: 'var(--color-sleep)',
    format: (v) => v.toFixed(1),
  },
  restingHeartRate: {
    key: 'restingHeartRate',
    label: 'Resting Heart Rate',
    unit: 'bpm',
    color: 'var(--color-heart)',
    format: (v) => `${Math.round(v)}`,
  },
  weightKg: {
    key: 'weightKg',
    label: 'Weight',
    unit: 'kg',
    color: 'var(--color-weight)',
    format: (v) => v.toFixed(1),
  },
}

export const METRIC_ORDER: MetricKey[] = [
  'steps',
  'caloriesBurned',
  'activeMinutes',
  'sleepHours',
  'waterIntakeMl',
  'restingHeartRate',
]
