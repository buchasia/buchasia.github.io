import type { GpxPoint, ValidatedGpx } from './gpxValidationTypes'
import type { GpxRouteSelectionOption } from './gpxRouteSelection'

export type ProjectedPoint = { x: number; y: number }
export type ProjectedRoute = { paths: ProjectedPoint[][]; scaleKilometres: number; hasDrawableRoute: boolean }

export const getSelectedRouteFragments = (gpx: ValidatedGpx, selection: GpxRouteSelectionOption): GpxPoint[][] => selection.activityIndices.flatMap(activityIndex => {
  const activity = gpx.activities[activityIndex]
  if (!activity) return []
  const segmentIndices = selection.segmentIndices?.[activityIndex] ?? activity.segments.map((_, index) => index)
  return segmentIndices.flatMap(segmentIndex => activity.segments[segmentIndex]?.points ? [activity.segments[segmentIndex].points] : [])
})

const unwrapLongitudes = (points: NonNullable<GpxPoint>[]) => {
  const result: { latitude: number; longitude: number }[] = []
  points.forEach(point => {
    let longitude = point.longitude
    const previous = result.at(-1)?.longitude
    if (previous !== undefined) {
      while (longitude - previous > 180) longitude -= 360
      while (longitude - previous < -180) longitude += 360
    }
    result.push({ latitude: point.latitude, longitude })
  })
  return result
}

const niceScale = (kilometres: number) => {
  const exponent = Math.floor(Math.log10(Math.max(kilometres, 0.001)))
  const magnitude = 10 ** exponent
  const normalized = kilometres / magnitude
  const step = normalized >= 5 ? 5 : normalized >= 2 ? 2 : 1
  return step * magnitude
}

export const projectRoute = (gpx: ValidatedGpx, selection: GpxRouteSelectionOption, width: number, height: number, padding = 180): ProjectedRoute => {
  const fragments = getSelectedRouteFragments(gpx, selection).flatMap(points => {
    const valid: NonNullable<GpxPoint>[] = []
    const result: NonNullable<GpxPoint>[][] = []
    points.forEach(point => {
      if (point) valid.push(point)
      else if (valid.length) { result.push(valid.splice(0, valid.length)) }
    })
    if (valid.length) result.push(valid.splice(0, valid.length))
    return result
  }).filter(fragment => fragment.length >= 2 && fragment.some((point, index) => index > 0 && point.latitude !== fragment[index - 1]!.latitude || index > 0 && point.longitude !== fragment[index - 1]!.longitude))
  if (!fragments.length) return { paths: [], scaleKilometres: 0, hasDrawableRoute: false }

  const unwrapped = fragments.map(unwrapLongitudes)
  const all = unwrapped.flat()
  const meanLatitude = all.reduce((sum, point) => sum + point.latitude, 0) / all.length
  const longitudeScale = Math.cos(meanLatitude * Math.PI / 180)
  const minLongitude = Math.min(...all.map(point => point.longitude))
  const maxLongitude = Math.max(...all.map(point => point.longitude))
  const minLatitude = Math.min(...all.map(point => point.latitude))
  const maxLatitude = Math.max(...all.map(point => point.latitude))
  const routeWidth = Math.max((maxLongitude - minLongitude) * longitudeScale, 0.000001)
  const routeHeight = Math.max(maxLatitude - minLatitude, 0.000001)
  const availableWidth = Math.max(width - padding * 2, 1)
  const availableHeight = Math.max(height - padding * 2, 1)
  const scale = Math.min(availableWidth / routeWidth, availableHeight / routeHeight)
  const offsetX = padding + (availableWidth - routeWidth * scale) / 2
  const offsetY = padding + (availableHeight - routeHeight * scale) / 2
  const paths = unwrapped.map(fragment => fragment.map(point => ({
    x: offsetX + (point.longitude - minLongitude) * longitudeScale * scale,
    y: offsetY + (maxLatitude - point.latitude) * scale,
  })))
  const routeWidthKilometres = routeWidth * 111.32
  return { paths, scaleKilometres: niceScale(routeWidthKilometres * 0.25), hasDrawableRoute: true }
}
