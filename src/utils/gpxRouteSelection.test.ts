import { describe, expect, it } from 'vitest'
import { getDefaultGpxRouteSelection, getGpxRouteSelectionOptions } from './gpxRouteSelection'
import type { ValidatedGpx } from './gpxValidationTypes'

const gpx: ValidatedGpx = {
  pointCount: 5,
  usablePointCount: 5,
  invalidCoordinateCount: 0,
  activities: [
    { kind: 'route', segments: [{ points: [{ latitude: 1, longitude: 1 }, { latitude: 2, longitude: 2 }] }] },
    { kind: 'track', name: 'Morning run', segments: [{ points: [{ latitude: 3, longitude: 3 }, null, { latitude: 4, longitude: 4 }] }, { points: [{ latitude: 5, longitude: 5 }] }] },
  ],
}

describe('GPX route selection', () => {
  it('offers activities, their segments, and an all-activities option', () => {
    const options = getGpxRouteSelectionOptions(gpx, 'en')
    expect(options.map(option => option.label)).toEqual(['Route 1', 'Route 1 · Segment 1', 'Morning run', 'Morning run · Segment 1', 'Morning run · Segment 2', 'All tracks/routes'])
    expect(options.at(-1)?.usablePointCount).toBe(5)
  })

  it('defaults to the first usable track, otherwise the first activity', () => {
    const options = getGpxRouteSelectionOptions(gpx, 'de')
    expect(getDefaultGpxRouteSelection(gpx, options)?.id).toBe('activity-1')
    const routesOnly = { ...gpx, activities: [gpx.activities[0]!] }
    const routeOptions = getGpxRouteSelectionOptions(routesOnly, 'en')
    expect(getDefaultGpxRouteSelection(routesOnly, routeOptions)?.id).toBe('activity-0')
  })
})
