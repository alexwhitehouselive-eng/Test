# Vitals — Health & Fitness Dashboard

An interactive dashboard for tracking daily health and fitness metrics: steps,
calories burned, active minutes, sleep, water intake, resting heart rate, and
weight, plus a workout log.

## Features

- **KPI cards** for each metric with a 14-day sparkline, day-over-day delta,
  and progress toward a goal.
- **Trend chart** — pick a metric and a date range (7/14/30/90 days) to see
  it plotted against its goal line.
- **This week's steps** bar chart and a **calories by workout type**
  breakdown.
- **Quick-entry forms** to log today's numbers and add workouts.
- **Editable goals** for every metric.
- **Light / dark / system theme**.
- Seeded demo data for the last 90 days on first load; everything you edit is
  persisted to `localStorage`.

## Development

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

## Stack

React + TypeScript + Vite, Tailwind CSS, and Recharts.
