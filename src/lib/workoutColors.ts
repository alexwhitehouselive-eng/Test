import type { WorkoutType } from './types'

// Fixed categorical order — never reassigned per filter/selection.
export const WORKOUT_TYPE_ORDER: WorkoutType[] = [
  'Run',
  'Walk',
  'Cycling',
  'Strength',
  'Swim',
  'Yoga',
  'HIIT',
  'Other',
]

export const WORKOUT_TYPE_COLOR: Record<WorkoutType, string> = {
  Run: 'var(--series-blue)',
  Walk: 'var(--series-orange)',
  Cycling: 'var(--series-aqua)',
  Strength: 'var(--series-yellow)',
  Swim: 'var(--series-magenta)',
  Yoga: 'var(--series-green)',
  HIIT: 'var(--series-violet)',
  Other: 'var(--series-red)',
}
