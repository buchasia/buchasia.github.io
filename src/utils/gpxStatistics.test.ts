import { describe, expect, it } from 'vitest'
import { calculateGpxStatistics, formatGpxDistance, formatGpxPace } from './gpxStatistics'
import type { ValidatedGpx } from './gpxValidationTypes'
import type { GpxRouteSelectionOption } from './gpxRouteSelection'

const selection: GpxRouteSelectionOption = { id: 'activity-0', label: 'Track 1', activityIndices: [0], usablePointCount: 4 }

describe('GPX statistics', () => {
  it('calculates distance and recorded time without bridging invalid-point breaks', () => {
    const gpx: ValidatedGpx = {
      pointCount: 5, usablePointCount: 4, invalidCoordinateCount: 1,
      activities: [{ kind: 'track', segments: [{ points: [
        { latitude: 0, longitude: 0, timeText: '2026-01-01T00:00:00Z' },
        { latitude: 0, longitude: 0.01, timeText: '2026-01-01T00:01:00Z' },
        null,
        { latitude: 0, longitude: 0.02, timeText: '2026-01-01T00:02:00Z' },
        { latitude: 0, longitude: 0.03, timeText: '2026-01-01T00:03:00Z' },
      ] }] }],
    }
    const stats = calculateGpxStatistics(gpx, selection)
    expect(stats.distanceMeters).toBeGreaterThan(2000)
    expect(stats.distanceMeters).toBeLessThan(2300)
    expect(stats.recordedTimeSeconds).toBe(120)
    expect(stats.paceSecondsPerKm).toBeDefined()
  })

  it('requires complete valid timestamps and elevations for dependent metrics', () => {
    const gpx: ValidatedGpx = {
      pointCount: 2, usablePointCount: 2, invalidCoordinateCount: 0,
      activities: [{ kind: 'track', segments: [{ points: [
        { latitude: 1, longitude: 1, timeText: 'invalid', elevationText: '10' },
        { latitude: 1, longitude: 1.01, elevationText: 'bad' },
      ] }] }],
    }
    const stats = calculateGpxStatistics(gpx, selection)
    expect(stats.recordedTimeSeconds).toBeUndefined()
    expect(stats.elevationGainMeters).toBeUndefined()
    expect(stats.startTimeMs).toBeUndefined()
  })

  it('formats metric and imperial distance and pace', () => {
    expect(formatGpxDistance(1500, 'metric')).toBe('1.50 km')
    expect(formatGpxDistance(1609.344, 'imperial')).toBe('1.00 mi')
    expect(formatGpxPace(360, 'metric')).toBe('6:00 /km')
    expect(formatGpxPace(360, 'imperial')).toBe('9:39 /mi')
  })
})
