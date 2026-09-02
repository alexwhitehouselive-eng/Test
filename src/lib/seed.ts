import type { DailyMetrics, Goals, Workout, WorkoutType } from './types'

// Small seeded PRNG so demo data is stable across reloads until the user
// edits it, instead of reshuffling every time the app mounts.
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260902)

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export const DEFAULT_GOALS: Goals = {
  steps: 10000,
  activeMinutes: 45,
  caloriesBurned: 2400,
  waterIntakeMl: 2500,
  sleepHours: 8,
  weightKg: 75,
}

const WORKOUT_TYPES: WorkoutType[] = ['Run', 'Walk', 'Cycling', 'Strength', 'Swim', 'Yoga', 'HIIT']

export function generateSeedMetrics(days = 90): DailyMetrics[] {
  const out: DailyMetrics[] = []
  const today = new Date()
  let weight = 78

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dow = d.getDay()
    const weekendBoost = dow === 0 || dow === 6 ? 0.85 : 1

    const steps = Math.round((4500 + rand() * 8500) * weekendBoost)
    const activeMinutes = Math.round(15 + rand() * 60 * weekendBoost)
    const caloriesBurned = Math.round(1700 + steps * 0.045 + activeMinutes * 4 + rand() * 200)
    const waterIntakeMl = Math.round(1200 + rand() * 2000)
    const sleepHours = Math.round((5.5 + rand() * 3.2) * 10) / 10
    const restingHeartRate = Math.round(56 + rand() * 16)

    // slow weight drift with noise, trending gently downward
    weight += (rand() - 0.56) * 0.18
    const weightKg = Math.round(weight * 10) / 10

    out.push({
      date: toISODate(d),
      steps,
      activeMinutes,
      caloriesBurned,
      waterIntakeMl,
      sleepHours,
      restingHeartRate,
      weightKg,
    })
  }

  return out
}

export function generateSeedWorkouts(metrics: DailyMetrics[]): Workout[] {
  const workouts: Workout[] = []
  let id = 1
  for (const m of metrics) {
    // roughly every other day, with some randomness
    if (rand() < 0.55) {
      const type = WORKOUT_TYPES[Math.floor(rand() * WORKOUT_TYPES.length)]
      const durationMin = Math.round(15 + rand() * 75)
      const intensity = type === 'HIIT' ? 11 : type === 'Run' ? 9 : type === 'Strength' ? 6 : 5
      const caloriesBurned = Math.round(durationMin * intensity * (0.85 + rand() * 0.3))
      workouts.push({
        id: `w${id++}`,
        date: m.date,
        type,
        durationMin,
        caloriesBurned,
        notes: undefined,
      })
    }
  }
  return workouts.reverse()
}
