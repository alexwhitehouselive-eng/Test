import type { MetricUpdate } from './mergeMetrics'

type AliasTarget = keyof Omit<MetricUpdate, 'date'> | 'weightLb' | 'sleepHoursFromMinutes'

const HEADER_ALIASES: Record<string, AliasTarget> = {
  steps: 'steps',
  stepcount: 'steps',
  'step count': 'steps',
  activeminutes: 'activeMinutes',
  'active minutes': 'activeMinutes',
  exerciseminutes: 'activeMinutes',
  'minutes active': 'activeMinutes',
  'apple exercise time': 'activeMinutes',
  caloriesburned: 'caloriesBurned',
  'calories burned': 'caloriesBurned',
  calories: 'caloriesBurned',
  'active calories': 'caloriesBurned',
  'active energy': 'caloriesBurned',
  waterintakeml: 'waterIntakeMl',
  'water intake': 'waterIntakeMl',
  'water (ml)': 'waterIntakeMl',
  water: 'waterIntakeMl',
  sleephours: 'sleepHours',
  'sleep hours': 'sleepHours',
  'sleep (hrs)': 'sleepHours',
  sleep: 'sleepHours',
  'minutes asleep': 'sleepHoursFromMinutes',
  restingheartrate: 'restingHeartRate',
  'resting heart rate': 'restingHeartRate',
  'resting hr': 'restingHeartRate',
  weightkg: 'weightKg',
  'weight (kg)': 'weightKg',
  weight: 'weightKg',
  'weight (lb)': 'weightLb',
  'weight (lbs)': 'weightLb',
}

const CSV_TEMPLATE_HEADERS = [
  'date',
  'steps',
  'activeMinutes',
  'caloriesBurned',
  'waterIntakeMl',
  'sleepHours',
  'restingHeartRate',
  'weightKg',
]

export function downloadCsvTemplate() {
  const example = ['2026-09-01', '10000', '45', '2400', '2500', '7.5', '58', '75.0']
  const csv = `${CSV_TEMPLATE_HEADERS.join(',')}\n${example.join(',')}\n`
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'vitals-import-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      cells.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  cells.push(cur)
  return cells.map((c) => c.trim())
}

function normalizeDate(raw: string): string | null {
  const trimmed = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const d = new Date(trimmed)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

export interface CsvImportResult {
  updates: MetricUpdate[]
  warnings: string[]
  rowsRead: number
}

export async function importCsv(file: File): Promise<CsvImportResult> {
  const text = await file.text()
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  const warnings: string[] = []

  if (lines.length < 2) {
    return { updates: [], warnings: ['File has no data rows.'], rowsRead: 0 }
  }

  const headerCells = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim())
  const dateIdx = headerCells.findIndex((h) => h === 'date')
  if (dateIdx === -1) {
    return { updates: [], warnings: ['No "date" column found.'], rowsRead: 0 }
  }

  const columnMap = new Map<number, AliasTarget>()
  headerCells.forEach((h, i) => {
    if (i === dateIdx) return
    const mapped = HEADER_ALIASES[h]
    if (mapped) columnMap.set(i, mapped)
  })

  if (columnMap.size === 0) {
    return {
      updates: [],
      warnings: ['No recognized metric columns found. Download the template for the expected headers.'],
      rowsRead: 0,
    }
  }

  const updates: MetricUpdate[] = []
  let rowsRead = 0

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i])
    if (cells.every((c) => c === '')) continue
    const date = normalizeDate(cells[dateIdx] ?? '')
    if (!date) {
      warnings.push(`Row ${i + 1}: unrecognized date "${cells[dateIdx]}", skipped.`)
      continue
    }

    const update: MetricUpdate = { date }
    for (const [colIdx, field] of columnMap) {
      const raw = cells[colIdx]
      if (raw === undefined || raw === '') continue
      const num = Number(raw)
      if (Number.isNaN(num)) continue
      if (field === 'weightLb') update.weightKg = num * 0.453592
      else if (field === 'sleepHoursFromMinutes') update.sleepHours = num / 60
      else (update as unknown as Record<string, number>)[field] = num
    }
    updates.push(update)
    rowsRead++
  }

  return { updates, warnings, rowsRead }
}
