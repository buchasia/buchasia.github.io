import { describe, expect, it } from 'vitest'
import { projectRoute } from './routeProjection'
import type { ValidatedGpx } from './gpxValidationTypes'
import type { GpxRouteSelectionOption } from './gpxRouteSelection'

const selection: GpxRouteSelectionOption = { id: 'activity-0', label: 'Track 1', activityIndices: [0], usablePointCount: 3 }

describe('route projection', () => {
  it('fits a north-up route without stretching its axes', () => {
    const gpx: ValidatedGpx = { pointCount: 3, usablePointCount: 3, invalidCoordinateCount: 0, activities: [{ kind: 'track', segments: [{ points: [{ latitude: 50, longitude: 10 }, { latitude: 50.01, longitude: 10.01 }, { latitude: 50.02, longitude: 10 }] }] }] }
    const result = projectRoute(gpx, selection, 2480, 3508)
    expect(result.hasDrawableRoute).toBe(true)
    expect(result.paths[0]![0]!.y).toBeGreaterThan(result.paths[0]![2]!.y)
    expect(result.paths[0]![0]!.x).toBeCloseTo(result.paths[0]![2]!.x)
    expect(result.scaleKilometres).toBeGreaterThan(0)
  })

  it('unwraps an antimeridian crossing and preserves fragment breaks', () => {
    const gpx: ValidatedGpx = { pointCount: 4, usablePointCount: 3, invalidCoordinateCount: 1, activities: [{ kind: 'track', segments: [{ points: [{ latitude: 0, longitude: 179.9 }, { latitude: 0, longitude: -179.9 }, null, { latitude: 1, longitude: 0 }] }] }] }
    const result = projectRoute(gpx, selection, 1000, 1000)
    expect(result.paths).toHaveLength(1)
    expect(result.paths[0]).toHaveLength(2)
  })
})
