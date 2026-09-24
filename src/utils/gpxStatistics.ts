import type { GpxPoint, ValidatedGpx } from './gpxValidationTypes'
import type { GpxRouteSelectionOption } from './gpxRouteSelection'

export type GpxDistanceUnit = 'metric' | 'imperial'

export type GpxStatistics = {
  distanceMeters: number
  recordedTimeSeconds?: number
  paceSecondsPerKm?: number
  elevationGainMeters?: number
  elevationLossMeters?: number
  minimumElevationMeters?: number
  maximumElevationMeters?: number
  startTimeMs?: number
  endTimeMs?: number
  fragmentCount: number
}

const EARTH_RADIUS_METERS = 6_371_008.8
const METERS_PER_MILE = 1_609.344
const METERS_PER_FOOT = 0.3048

const toRadians = (degrees: number) => degrees * Math.PI / 180

// Haversine distance on a mean-earth sphere; adjacent points are measured separately.
const distanceBetween = (a: NonNullable<GpxPoint>, b: NonNullable<GpxPoint>) => {
  const latitudeDelta = toRadians(b.latitude - a.latitude)
  const longitudeDelta = toRadians(b.longitude - a.longitude)
  const latitudeA = toRadians(a.latitude)
  const latitudeB = toRadians(b.latitude)
  const value = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(longitudeDelta / 2) ** 2
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(Math.min(1, value)))
}

const selectedFragments = (gpx: ValidatedGpx, selection: GpxRouteSelectionOption): GpxPoint[][] => selection.activityIndices.flatMap(activityIndex => {
  const activity = gpx.activities[activityIndex]
  if (!activity) return []
  const indices = selection.segmentIndices?.[activityIndex] ?? activity.segments.map((_, index) => index)
  return indices.flatMap(segmentIndex => activity.segments[segmentIndex]?.points ? [activity.segments[segmentIndex].points] : [])
})

const splitValidFragments = (segments: GpxPoint[][]) => segments.flatMap(points => {
  const fragments: NonNullable<GpxPoint>[][] = []
  let current: NonNullable<GpxPoint>[] = []
  points.forEach(point => {
    if (point) current.push(point)
    else if (current.length) { fragments.push(current); current = [] }
  })
  if (current.length) fragments.push(current)
  return fragments
})

const timestamp = (point: NonNullable<GpxPoint>) => {
  if (!point.timeText) return undefined
  const value = Date.parse(point.timeText)
  return Number.isFinite(value) ? value : undefined
}

const elevation = (point: NonNullable<GpxPoint>) => {
  if (point.elevationText === undefined || point.elevationText.trim() === '') return undefined
  const value = Number(point.elevationText)
  return Number.isFinite(value) ? value : undefined
}

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2
}

export const calculateGpxStatistics = (gpx: ValidatedGpx, selection: GpxRouteSelectionOption): GpxStatistics => {
  const fragments = splitValidFragments(selectedFragments(gpx, selection))
  let distanceMeters = 0
  fragments.forEach(fragment => {
    for (let index = 1; index < fragment.length; index += 1) distanceMeters += distanceBetween(fragment[index - 1]!, fragment[index]!)
  })

  const timestamps = fragments.map(fragment => fragment.map(timestamp))
  const completeTime = fragments.length > 0 && timestamps.every(values => values.every((value): value is number => value !== undefined && Number.isFinite(value)) && values.every((value, index) => index === 0 || value >= values[index - 1]!))
  const recordedTimeSeconds = completeTime
    ? timestamps.reduce((total, values) => total + ((values.at(-1)! - values[0]!) / 1000), 0)
    : undefined
  const allTimestamps = timestamps.flat().filter((value): value is number => value !== undefined)

  const elevations = fragments.map(fragment => fragment.map(elevation))
  const completeElevation = fragments.length > 0 && elevations.every(values => values.every((value): value is number => value !== undefined && Number.isFinite(value)))
  let elevationGainMeters: number | undefined
  let elevationLossMeters: number | undefined
  let minimumElevationMeters: number | undefined
  let maximumElevationMeters: number | undefined
  if (completeElevation) {
    const smoothed = elevations.map(values => values.map((_, index) => median(values.slice(Math.max(0, index - 2), Math.min(values.length, index + 3)))))
    elevationGainMeters = 0
    elevationLossMeters = 0
    smoothed.forEach(values => values.slice(1).forEach((value, index) => {
      const difference = value - values[index]!
      if (difference > 0) elevationGainMeters! += difference
      if (difference < 0) elevationLossMeters! += Math.abs(difference)
    }))
    const rawElevations = elevations.flat()
    minimumElevationMeters = Math.min(...rawElevations)
    maximumElevationMeters = Math.max(...rawElevations)
  }

  return {
    distanceMeters,
    recordedTimeSeconds: recordedTimeSeconds !== undefined && recordedTimeSeconds > 0 ? recordedTimeSeconds : undefined,
    paceSecondsPerKm: recordedTimeSeconds !== undefined && recordedTimeSeconds > 0 && distanceMeters > 0 ? recordedTimeSeconds / (distanceMeters / 1000) : undefined,
    elevationGainMeters,
    elevationLossMeters,
    minimumElevationMeters,
    maximumElevationMeters,
    startTimeMs: allTimestamps.length ? Math.min(...allTimestamps) : undefined,
    endTimeMs: allTimestamps.length ? Math.max(...allTimestamps) : undefined,
    fragmentCount: fragments.length,
  }
}

const formatNumber = (value: number, digits = 2) => value.toLocaleString('en', { maximumFractionDigits: digits, minimumFractionDigits: digits })

export const formatGpxDistance = (meters: number, unit: GpxDistanceUnit) => unit === 'metric'
  ? meters >= 1000 ? `${formatNumber(meters / 1000)} km` : `${Math.round(meters)} m`
  : meters >= METERS_PER_MILE ? `${formatNumber(meters / METERS_PER_MILE)} mi` : `${Math.round(meters / METERS_PER_FOOT)} ft`

export const formatGpxElevation = (meters: number, unit: GpxDistanceUnit) => unit === 'metric' ? `${Math.round(meters)} m` : `${Math.round(meters / METERS_PER_FOOT)} ft`

export const formatGpxDuration = (seconds: number) => {
  const total = Math.round(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60).toString().padStart(2, '0')
  const remainder = (total % 60).toString().padStart(2, '0')
  return hours ? `${hours}:${minutes}:${remainder}` : `${minutes}:${remainder}`
}

export const formatGpxPace = (secondsPerKm: number, unit: GpxDistanceUnit) => {
  const seconds = Math.round(unit === 'metric' ? secondsPerKm : secondsPerKm * METERS_PER_MILE / 1000)
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')} /${unit === 'metric' ? 'km' : 'mi'}`
}

export const formatGpxDateTime = (timeMs: number, locale: 'en' | 'de') => new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
  year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short',
}).format(new Date(timeMs))
