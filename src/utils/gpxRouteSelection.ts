import type { GpxActivity, GpxPoint, ValidatedGpx } from './gpxValidationTypes'
import type { GpxMessageLocale } from './gpxValidationTypes'

export type GpxRouteSelectionOption = {
  id: string
  label: string
  activityIndices: number[]
  segmentIndices?: Record<number, number[]>
  usablePointCount: number
}

const usablePoints = (points: GpxPoint[]) => points.reduce((count, point) => count + (point ? 1 : 0), 0)
const activityPointCount = (activity: GpxActivity) => activity.segments.reduce((count, segment) => count + usablePoints(segment.points), 0)

const activityKindLabel = (activity: GpxActivity, index: number, locale: GpxMessageLocale) => {
  const fallback = locale === 'de'
    ? activity.kind === 'track' ? `Track ${index + 1}` : `Route ${index + 1}`
    : activity.kind === 'track' ? `Track ${index + 1}` : `Route ${index + 1}`
  return activity.name?.trim() || fallback
}

export const getGpxRouteSelectionOptions = (gpx: ValidatedGpx, locale: GpxMessageLocale): GpxRouteSelectionOption[] => {
  const options: GpxRouteSelectionOption[] = []
  gpx.activities.forEach((activity, activityIndex) => {
    const label = activityKindLabel(activity, activityIndex, locale)
    options.push({ id: `activity-${activityIndex}`, label, activityIndices: [activityIndex], usablePointCount: activityPointCount(activity) })
    activity.segments.forEach((segment, segmentIndex) => {
      options.push({
        id: `segment-${activityIndex}-${segmentIndex}`,
        label: `${label} · ${locale === 'de' ? 'Segment' : 'Segment'} ${segmentIndex + 1}`,
        activityIndices: [activityIndex],
        segmentIndices: { [activityIndex]: [segmentIndex] },
        usablePointCount: usablePoints(segment.points),
      })
    })
  })
  if (gpx.activities.length > 1) {
    options.push({
      id: 'all',
      label: locale === 'de' ? 'Alle Tracks/Routen' : 'All tracks/routes',
      activityIndices: gpx.activities.map((_, index) => index),
      usablePointCount: gpx.activities.reduce((count, activity) => count + activityPointCount(activity), 0),
    })
  }
  return options
}

export const getDefaultGpxRouteSelection = (gpx: ValidatedGpx, options: GpxRouteSelectionOption[]) => {
  const track = gpx.activities.findIndex(activity => activity.kind === 'track' && activityPointCount(activity) > 0)
  const preferred = track >= 0 ? `activity-${track}` : options.find(option => option.id.startsWith('activity-'))?.id
  return options.find(option => option.id === preferred) ?? options[0]
}
