import type { DailyMetrics } from './types'

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

export function lastNDays(metrics: DailyMetrics[], n: number): DailyMetrics[] {
  return metrics.slice(Math.max(0, metrics.length - n))
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatWeekday(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short' })
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function isSameDay(a: string, b: string): boolean {
  return a === b
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}
