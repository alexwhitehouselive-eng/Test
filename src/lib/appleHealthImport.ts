import type { MetricUpdate } from './mergeMetrics'
import type { Workout, WorkoutType } from './types'

const RECORD_TYPES = {
  HKQuantityTypeIdentifierStepCount: 'steps',
  HKQuantityTypeIdentifierAppleExerciseTime: 'activeMinutes',
  HKQuantityTypeIdentifierActiveEnergyBurned: 'caloriesBurned',
  HKQuantityTypeIdentifierDietaryWater: 'waterIntakeMl',
  HKQuantityTypeIdentifierRestingHeartRate: 'restingHeartRate',
  HKQuantityTypeIdentifierBodyMass: 'weightKg',
} as const

type TrackedType = keyof typeof RECORD_TYPES

const WORKOUT_TYPE_MAP: Record<string, WorkoutType> = {
  HKWorkoutActivityTypeRunning: 'Run',
  HKWorkoutActivityTypeWalking: 'Walk',
  HKWorkoutActivityTypeCycling: 'Cycling',
  HKWorkoutActivityTypeTraditionalStrengthTraining: 'Strength',
  HKWorkoutActivityTypeFunctionalStrengthTraining: 'Strength',
  HKWorkoutActivityTypeSwimming: 'Swim',
  HKWorkoutActivityTypeYoga: 'Yoga',
  HKWorkoutActivityTypeHighIntensityIntervalTraining: 'HIIT',
}

interface DayAccumulator {
  steps: number
  activeMinutes: number
  caloriesBurned: number
  waterIntakeMl: number
  sleepSeconds: number
  restingHeartRate: number | null
  weightKg: number | null
}

function newDay(): DayAccumulator {
  return {
    steps: 0,
    activeMinutes: 0,
    caloriesBurned: 0,
    waterIntakeMl: 0,
    sleepSeconds: 0,
    restingHeartRate: null,
    weightKg: null,
  }
}

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`))
  return m ? m[1] : null
}

function dateKey(iso: string): string | null {
  // Apple dates look like "2026-08-30 07:15:00 -0700"
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : null
}

function convertToUnit(value: number, unit: string | null, target: 'kg' | 'mL'): number {
  if (!unit) return value
  const u = unit.toLowerCase()
  if (target === 'kg') {
    if (u === 'lb' || u === 'lbs' || u === 'pound') return value * 0.453592
    return value
  }
  if (target === 'mL') {
    if (u === 'fl_oz_us' || u === 'floz') return value * 29.5735
    if (u === 'l') return value * 1000
    return value
  }
  return value
}

export interface AppleHealthImportResult {
  updates: MetricUpdate[]
  workouts: Workout[]
  recordsScanned: number
  warnings: string[]
}

const RECORD_TAG_RE = /<Record\b[^>]*\/>/g
const WORKOUT_TAG_RE = /<Workout\b[^>]*?(?:\/>|>)/g
const SLEEP_TYPE = 'HKCategoryTypeIdentifierSleepAnalysis'
const SLEEP_ASLEEP_VALUES = new Set([
  'HKCategoryValueSleepAnalysisAsleep',
  'HKCategoryValueSleepAnalysisAsleepCore',
  'HKCategoryValueSleepAnalysisAsleepDeep',
  'HKCategoryValueSleepAnalysisAsleepREM',
  'HKCategoryValueSleepAnalysisAsleepUnspecified',
])

/**
 * Streams Apple Health's export.xml (which can be hundreds of MB) in chunks
 * rather than loading it fully into the DOM, matching self-closing
 * <Record .../> and <Workout .../> tags line-by-line via regex — reliable in
 * practice since Apple has kept this export format stable and flat.
 */
// Give the browser a chance to repaint (so the progress bar actually moves
// and the tab doesn't look frozen) between bursts of synchronous regex work
// on a large chunk.
function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

const YIELD_EVERY_N_TAGS = 400

export async function importAppleHealthExport(
  file: File,
  onProgress?: (bytesRead: number, totalBytes: number) => void,
): Promise<AppleHealthImportResult> {
  const days = new Map<string, DayAccumulator>()
  const workouts: Workout[] = []
  const warnings: string[] = []
  let recordsScanned = 0
  let workoutId = 0
  let carry = ''

  async function processChunk(chunk: string, isFinal: boolean) {
    const text = carry + chunk
    // hold back a partial trailing tag until the next chunk (or EOF)
    const lastOpen = text.lastIndexOf('<')
    const boundary = isFinal ? text.length : lastOpen === -1 ? text.length : lastOpen
    const usable = text.slice(0, boundary)
    carry = text.slice(boundary)

    const recordTags = usable.match(RECORD_TAG_RE) ?? []
    let sinceYield = 0

    for (const tag of recordTags) {
      if (++sinceYield >= YIELD_EVERY_N_TAGS) {
        sinceYield = 0
        await yieldToBrowser()
      }
      const type = attr(tag, 'type')
      if (!type) continue

      if (type === SLEEP_TYPE) {
        const value = attr(tag, 'value')
        const start = attr(tag, 'startDate')
        const end = attr(tag, 'endDate')
        if (value && SLEEP_ASLEEP_VALUES.has(value) && start && end) {
          const key = dateKey(start)
          if (key) {
            const day = days.get(key) ?? newDay()
            const seconds = (new Date(end).getTime() - new Date(start).getTime()) / 1000
            if (seconds > 0) day.sleepSeconds += seconds
            days.set(key, day)
          }
        }
        recordsScanned++
        continue
      }

      if (!(type in RECORD_TYPES)) continue
      const field = RECORD_TYPES[type as TrackedType]
      const start = attr(tag, 'startDate')
      const valueRaw = attr(tag, 'value')
      if (!start || valueRaw === null) continue
      const key = dateKey(start)
      if (!key) continue
      const value = Number(valueRaw)
      if (Number.isNaN(value)) continue

      const day = days.get(key) ?? newDay()
      const unit = attr(tag, 'unit')
      if (field === 'weightKg') day.weightKg = convertToUnit(value, unit, 'kg')
      else if (field === 'restingHeartRate') day.restingHeartRate = value
      else if (field === 'waterIntakeMl') day.waterIntakeMl += convertToUnit(value, unit, 'mL')
      else day[field] += value
      days.set(key, day)
      recordsScanned++
    }

    for (const tag of usable.match(WORKOUT_TAG_RE) ?? []) {
      if (++sinceYield >= YIELD_EVERY_N_TAGS) {
        sinceYield = 0
        await yieldToBrowser()
      }
      const activityType = attr(tag, 'workoutActivityType')
      const start = attr(tag, 'startDate')
      if (!activityType || !start) continue
      const key = dateKey(start)
      if (!key) continue
      const durationRaw = attr(tag, 'duration')
      const energyRaw = attr(tag, 'totalEnergyBurned')
      workoutId++
      workouts.push({
        id: `applehealth-${key}-${workoutId}`,
        date: key,
        type: WORKOUT_TYPE_MAP[activityType] ?? 'Other',
        durationMin: durationRaw ? Math.round(Number(durationRaw)) : 0,
        caloriesBurned: energyRaw ? Math.round(Number(energyRaw)) : 0,
      })
    }
  }

  const totalBytes = file.size

  if (typeof file.stream === 'function') {
    const reader = file.stream().getReader()
    const decoder = new TextDecoder()
    let bytesRead = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) {
        await processChunk('', true)
        break
      }
      bytesRead += value.byteLength
      await processChunk(decoder.decode(value, { stream: true }), false)
      onProgress?.(bytesRead, totalBytes)
    }
  } else {
    // Fallback for browsers without Blob.stream() (older Safari). Reads the
    // whole file into memory at once — still correct, just without
    // incremental progress on very large files.
    const text = await file.text()
    onProgress?.(totalBytes, totalBytes)
    await processChunk(text, true)
  }

  if (days.size === 0 && workouts.length === 0) {
    warnings.push('No recognized Apple Health records found in this file.')
  }

  const updates: MetricUpdate[] = [...days.entries()].map(([date, d]) => {
    const update: MetricUpdate = { date }
    if (d.steps > 0) update.steps = Math.round(d.steps)
    if (d.activeMinutes > 0) update.activeMinutes = Math.round(d.activeMinutes)
    if (d.caloriesBurned > 0) update.caloriesBurned = Math.round(d.caloriesBurned)
    if (d.waterIntakeMl > 0) update.waterIntakeMl = Math.round(d.waterIntakeMl)
    if (d.sleepSeconds > 0) update.sleepHours = Math.round((d.sleepSeconds / 3600) * 10) / 10
    if (d.restingHeartRate !== null) update.restingHeartRate = Math.round(d.restingHeartRate)
    if (d.weightKg !== null) update.weightKg = Math.round(d.weightKg * 10) / 10
    return update
  })

  return { updates, workouts, recordsScanned, warnings }
}
