import type { DailyMetrics } from './types'

export type MetricUpdate = Partial<Omit<DailyMetrics, 'date'>> & { date: string }

const ZERO_METRICS: Omit<DailyMetrics, 'date'> = {
  steps: 0,
  activeMinutes: 0,
  caloriesBurned: 0,
  waterIntakeMl: 0,
  sleepHours: 0,
  restingHeartRate: 0,
  weightKg: 0,
}

/**
 * Upserts partial per-day updates (from an import) into an existing metrics
 * history. Existing fields are only overwritten when the update actually
 * supplies that field; a brand-new date is zero-filled for anything the
 * update didn't supply, then interpolated from its nearest neighbor for
 * fields still at zero (weight/resting HR read as 0 look like an error, not
 * "unknown").
 */
export function mergeMetrics(
  existing: DailyMetrics[],
  updates: MetricUpdate[],
): { metrics: DailyMetrics[]; upserted: number } {
  const byDate = new Map(existing.map((m) => [m.date, { ...m }]))
  let upserted = 0

  for (const update of updates) {
    const current = byDate.get(update.date)
    if (current) {
      for (const key of Object.keys(update) as (keyof MetricUpdate)[]) {
        if (key === 'date') continue
        const value = update[key]
        if (typeof value === 'number' && !Number.isNaN(value)) {
          ;(current as unknown as Record<string, number>)[key] = value
        }
      }
    } else {
      byDate.set(update.date, { ...ZERO_METRICS, ...update, date: update.date })
    }
    upserted++
  }

  const merged = [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1))

  // fill zero-valued carry fields (weight, resting HR) from the nearest prior day
  for (const key of ['weightKg', 'restingHeartRate'] as const) {
    let last = 0
    for (const m of merged) {
      if (m[key] > 0) last = m[key]
      else if (last > 0) m[key] = last
    }
  }

  return { metrics: merged, upserted }
}
