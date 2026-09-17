import localRuns from '../../content/data/runs.json'

export type Run = {
  id: string
  date: Date
  distance: number // in meters
  duration: number // in seconds
  notes?: string
  eventName?: string
  activityType?: string
  title?: string
  calories?: number
  averageHeartRate?: number
  maximumHeartRate?: number
  aerobicTrainingEffect?: number
  averageCadence?: number
  maximumCadence?: number
  averagePace?: number // seconds per kilometre
  bestPace?: number // seconds per kilometre
  totalAscent?: number // metres
  totalDescent?: number // metres
  averageStrideLength?: number // metres
  trainingStressScore?: number
  steps?: number
  minimumTemperature?: number // Celsius
  maximumTemperature?: number // Celsius
  movingDuration?: number // seconds
  elapsedDuration?: number // seconds
  minimumElevation?: number // metres
  maximumElevation?: number // metres
}

export const RUNS_FETCH_URL = 'https://raw.githubusercontent.com/buchasia/buchasia.github.io/main/content/data/runs.json'

/**
 * Fetches the raw run data from the remote source.
 * Note: In a production environment, you might want to add a fallback or a local 
 * development path if the remote URL is not reachable.
 */
export async function fetchRuns(): Promise<Run[]> {
  // The checked-in export is the canonical source for the static site.
  return normalizeRuns(localRuns)
}

function normalizeRuns(data: unknown): Run[] {
  if (!Array.isArray(data)) return []
  return data
    .map((run): Run | null => {
      if (!run || typeof run !== 'object' || !('id' in run) || !run.id) return null
      const date = new Date(String('date' in run ? run.date : ''))
      if (Number.isNaN(date.getTime())) return null
      return {
        ...run,
        id: String(run.id),
        date,
        distance: Number('distance' in run ? run.distance : 0) || 0,
        duration: Number('duration' in run ? run.duration : 0) || 0,
      } as Run
    })
    .filter((run): run is Run => run !== null)
}

export const getRunStats = (runs: Run[]) => {
  const totalDistance = runs.reduce((sum, run) => sum + run.distance, 0)
  const totalDuration = runs.reduce((sum, run) => sum + run.duration, 0)
  const totalCount = runs.length
  const activeDays = new Set(runs.map(run => run.date.toISOString().slice(0, 10)))
  const sortedDays = [...activeDays].sort()
  let longestStreak = 0
  let runningStreak = 0
  sortedDays.forEach((day, index) => {
    const previous = index > 0 ? Date.parse(`${sortedDays[index - 1]}T00:00:00Z`) : 0
    const current = Date.parse(`${day}T00:00:00Z`)
    runningStreak = index > 0 && current - previous === 86400000 ? runningStreak + 1 : 1
    longestStreak = Math.max(longestStreak, runningStreak)
  })
  const longestRun = runs.reduce((longest, run) => run.distance > longest.distance ? run : longest, { distance: 0 } as Run)
  const fastestPace = runs.reduce((fastest, run) => {
    const pace = getRunPace(run)
    return pace > 0 && (!fastest || pace < fastest) ? pace : fastest
  }, 0)

  const yearlyData: Record<string, { distance: number; duration: number; count: number }> = {}
  
  runs.forEach(run => {
    const year = getRunYear(run)
    if (!yearlyData[year]) {
      yearlyData[year] = { distance: 0, duration: 0, count: 0 }
    }
    yearlyData[year].distance += run.distance
    yearlyData[year].duration += run.duration
    yearlyData[year].count += 1
  })

  return {
    totalDistance,
    totalDuration,
    totalCount,
    averageDistance: totalCount ? totalDistance / totalCount : 0,
    averagePace: totalDistance ? totalDuration / (totalDistance / 1000) : 0,
    fastestPace,
    longestDistance: longestRun.distance,
    activeDays: activeDays.size,
    longestStreak,
    currentStreak: sortedDays.length ? runningStreak : 0,
    yearlyData,
  }
}

export const formatDistance = (meters = 0, lang: 'en' | 'de' = 'en') => {
  const km = meters / 1000
  const value = new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { maximumFractionDigits: km >= 1 ? 2 : 0 }).format(km >= 1 ? km : Math.round(meters))
  return km >= 1 ? `${value} km` : `${value} m`
}

export const formatDuration = (seconds = 0, lang: 'en' | 'de' = 'en') => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const units = lang === 'de' ? ['Std.', 'Min.', 'Sek.'] : ['h', 'm', 's']
  if (hours > 0) return `${hours}${units[0]} ${minutes}${units[1]}`
  if (minutes === 0) return `${Math.round(seconds)}${units[2]}`
  return `${minutes}${units[1]}`
}

export const formatPace = (secondsPerKm = 0, lang: 'en' | 'de' = 'en') => {
  void lang
  if (!secondsPerKm) return '—'
  const minutes = Math.floor(secondsPerKm / 60)
  const seconds = Math.round(secondsPerKm % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds} /km`
}

/** Returns recorded pace when available, otherwise calculates it from duration and distance. */
export const getRunPace = (run: Run) => run.averagePace && run.averagePace > 0
  ? run.averagePace
  : run.distance > 0 && run.duration > 0
    ? run.duration / (run.distance / 1000)
    : 0

export const getRunHighlights = (runs: Run[]) => {
  const longestRun = runs.reduce((longest, run) => run.distance > longest.distance ? run : longest, { distance: 0 } as Run)
  const fastestRun = runs.filter(run => getRunPace(run) > 0).reduce((fastest, run) => !fastest || getRunPace(run) < getRunPace(fastest) ? run : fastest, null as Run | null)
  const monthly = getMonthlyStats(runs, runs[0]?.date.getUTCFullYear() ?? 0)
  const busiestMonth = monthly.reduce((best, month) => month.distance > best.distance ? month : best, { month: 0, distance: 0, duration: 0, count: 0 })
  const weeks = new Map<string, number>()
  for (const run of runs) {
    const day = new Date(Date.UTC(run.date.getUTCFullYear(), run.date.getUTCMonth(), run.date.getUTCDate()))
    day.setUTCDate(day.getUTCDate() - day.getUTCDay())
    const key = day.toISOString().slice(0, 10)
    weeks.set(key, (weeks.get(key) ?? 0) + run.distance)
  }
  return { longestRun, fastestRun, busiestMonth, longestWeekDistance: Math.max(0, ...weeks.values()) }
}

export const getRunYear = (run: Run) => run.date.getUTCFullYear().toString()

export const getYearDays = (runs: Run[], year: number) => {
  const days = Array.from({ length: 366 }, () => 0)
  for (const run of runs) {
    if (run.date.getUTCFullYear() !== year) continue
    const start = Date.UTC(year, 0, 1)
    const day = Math.floor((Date.UTC(year, run.date.getUTCMonth(), run.date.getUTCDate()) - start) / 86400000)
    days[day] += run.distance
  }
  const daysInYear = new Date(Date.UTC(year, 1, 29)).getUTCDate() === 29 ? 366 : 365
  return days.slice(0, daysInYear)
}

export const getMonthlyStats = (runs: Run[], year: number) =>
  Array.from({ length: 12 }, (_, month) => {
    const monthRuns = runs.filter(
      run => run.date.getUTCFullYear() === year && run.date.getUTCMonth() === month,
    )
    return {
      month,
      distance: monthRuns.reduce((sum, run) => sum + run.distance, 0),
      duration: monthRuns.reduce((sum, run) => sum + run.duration, 0),
      count: monthRuns.length,
      byType: monthRuns.reduce<Record<string, { distance: number; duration: number; count: number }>>((types, run) => {
        const type = run.activityType ?? 'Running'
        types[type] ??= { distance: 0, duration: 0, count: 0 }
        types[type].distance += run.distance
        types[type].duration += run.duration
        types[type].count += 1
        return types
      }, {}),
    }
  })
