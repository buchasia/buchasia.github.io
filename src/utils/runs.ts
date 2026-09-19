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
  const totalAscent = runs.reduce((sum, run) => sum + (run.totalAscent ?? 0), 0)
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

  const yearlyData: Record<string, { distance: number; duration: number; totalAscent: number; count: number }> = {}
  
  runs.forEach(run => {
    const year = getRunYear(run)
    if (!yearlyData[year]) {
      yearlyData[year] = { distance: 0, duration: 0, totalAscent: 0, count: 0 }
    }
    yearlyData[year].distance += run.distance
    yearlyData[year].duration += run.duration
    yearlyData[year].totalAscent += run.totalAscent ?? 0
    yearlyData[year].count += 1
  })

  return {
    totalDistance,
    totalDuration,
    totalAscent,
    totalCount,
    averageDistance: totalCount ? totalDistance / totalCount : 0,
    averageAscent: totalCount ? totalAscent / totalCount : 0,
    ascentPerKm: totalDistance ? totalAscent / (totalDistance / 1000) : 0,
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

export const formatElevation = (meters = 0, lang: 'en' | 'de' = 'en') =>
  `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { maximumFractionDigits: 0 }).format(Math.round(meters))} m`

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
  const totalSeconds = Math.round(secondsPerKm)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = (totalSeconds % 60).toString().padStart(2, '0')
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
  const highestAscentRun = runs.reduce((highest, run) => (run.totalAscent ?? 0) > (highest.totalAscent ?? 0) ? run : highest, { totalAscent: 0 } as Run)
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
  return { longestRun, highestAscentRun, fastestRun, busiestMonth, longestWeekDistance: Math.max(0, ...weeks.values()) }
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
      totalAscent: monthRuns.reduce((sum, run) => sum + (run.totalAscent ?? 0), 0),
      count: monthRuns.length,
      byType: monthRuns.reduce<Record<string, { distance: number; duration: number; totalAscent: number; count: number }>>((types, run) => {
        const type = run.activityType ?? 'Running'
        types[type] ??= { distance: 0, duration: 0, totalAscent: 0, count: 0 }
        types[type].distance += run.distance
        types[type].duration += run.duration
        types[type].totalAscent += run.totalAscent ?? 0
        types[type].count += 1
        return types
      }, {}),
    }
  })

export type AchievementMetric = 'distance' | 'duration' | 'ascent'
export type AchievementPeriod = 'month' | 'year'

export type RunTarget = {
  id: string
  period: AchievementPeriod
  metric: AchievementMetric
  step: number
}

export type RunningAchievement = {
  id: string
  period: AchievementPeriod
  periodKey: string
  metric: AchievementMetric
  target: number
  level: number
  achievedOn: Date
}

export type LockedRunningAchievement = Omit<RunningAchievement, 'achievedOn'> & {
  locked: true
}

export const getAchievementBadgeAssetId = (achievement: Pick<RunningAchievement, 'period' | 'metric' | 'target'>) =>
  `${achievement.period}-${achievement.metric}-${achievement.target}`

export const CUSTOM_ACHIEVEMENT_BADGE_ASSET_IDS = new Set([
  'month-distance-100000',
  'month-distance-200000',
  'month-distance-300000',
  'month-ascent-2000',
  'month-ascent-4000',
  'month-duration-36000',
  'month-duration-72000',
  'month-duration-108000',
  'year-distance-1000000',
  'year-distance-2000000',
  'year-distance-3000000',
  'year-ascent-10000',
  'year-ascent-20000',
  'year-ascent-30000',
  'year-duration-360000',
  'year-duration-720000',
  'year-duration-1080000',
])

export const getAchievementBadgeAssetPath = (achievement: Pick<RunningAchievement, 'period' | 'metric' | 'target'> & { locked?: boolean }) => {
  const assetId = getAchievementBadgeAssetId(achievement)
  const fileId = achievement.locked ? `${assetId}-locked` : assetId
  const extension = CUSTOM_ACHIEVEMENT_BADGE_ASSET_IDS.has(assetId) ? 'png' : 'svg'
  return `/images/achievements/milestones/${fileId}.${extension}`
}

export type RunningTargetSnapshot = RunTarget & {
  periodKey: string
  value: number
  nextTarget: number
}

export const RUN_TARGETS: RunTarget[] = [
  { id: 'monthly-distance', period: 'month', metric: 'distance', step: 100_000 },
  { id: 'monthly-duration', period: 'month', metric: 'duration', step: 36_000 },
  { id: 'monthly-ascent', period: 'month', metric: 'ascent', step: 2_000 },
  { id: 'yearly-distance', period: 'year', metric: 'distance', step: 1_000_000 },
  { id: 'yearly-duration', period: 'year', metric: 'duration', step: 360_000 },
  { id: 'yearly-ascent', period: 'year', metric: 'ascent', step: 10_000 },
]

const getAchievementValue = (run: Run, metric: AchievementMetric) => {
  if (metric === 'distance') return run.distance
  if (metric === 'duration') return run.duration
  return run.totalAscent ?? 0
}

const getAchievementPeriodKey = (date: Date, period: AchievementPeriod) => {
  const year = date.getUTCFullYear().toString()
  return period === 'year' ? year : `${year}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

const getLatestRunDate = (runs: Run[]) => runs.reduce<Date | null>((latest, run) => !latest || run.date > latest ? run.date : latest, null)

const getPeriodValue = (runs: Run[], period: AchievementPeriod, periodKey: string, metric: AchievementMetric) =>
  runs.reduce((sum, run) => getAchievementPeriodKey(run.date, period) === periodKey ? sum + getAchievementValue(run, metric) : sum, 0)

export const getRunningTargetSnapshots = (runs: Run[], date = getLatestRunDate(runs) ?? new Date()): RunningTargetSnapshot[] =>
  RUN_TARGETS.map(target => {
    const periodKey = getAchievementPeriodKey(date, target.period)
    const value = getPeriodValue(runs, target.period, periodKey, target.metric)
    return { ...target, periodKey, value, nextTarget: (Math.floor(value / target.step) + 1) * target.step }
  })

export const getNextYearlyMilestones = (runs: Run[], date = getLatestRunDate(runs) ?? new Date()): LockedRunningAchievement[] => {
  const periodKey = getAchievementPeriodKey(date, 'year')
  return RUN_TARGETS
    .filter(target => target.period === 'year')
    .map(target => {
      const value = getPeriodValue(runs, target.period, periodKey, target.metric)
      const level = Math.floor(value / target.step) + 1
      const targetValue = level * target.step
      return {
        id: `locked-year-${periodKey}-${target.metric}-${targetValue}`,
        period: 'year',
        periodKey,
        metric: target.metric,
        target: targetValue,
        level,
        locked: true as const,
      }
    })
}

export const getRunningAchievements = (runs: Run[]): RunningAchievement[] => {
  const totals = new Map<string, number>()
  const achievements: RunningAchievement[] = []
  const sortedRuns = [...runs].sort((a, b) => a.date.getTime() - b.date.getTime())

  for (const run of sortedRuns) {
    for (const target of RUN_TARGETS) {
      const periodKey = getAchievementPeriodKey(run.date, target.period)
      const key = `${target.id}:${periodKey}`
      const before = totals.get(key) ?? 0
      const after = before + getAchievementValue(run, target.metric)
      const firstTarget = (Math.floor(before / target.step) + 1) * target.step
      const lastTarget = Math.floor(after / target.step) * target.step
      for (let milestone = firstTarget; milestone <= lastTarget; milestone += target.step) {
        achievements.push({ id: `${target.period}-${periodKey}-${target.metric}-${milestone}`, period: target.period, periodKey, metric: target.metric, target: milestone, level: milestone / target.step, achievedOn: run.date })
      }
      totals.set(key, after)
    }
  }

  return achievements.sort((a, b) => b.achievedOn.getTime() - a.achievedOn.getTime())
}
