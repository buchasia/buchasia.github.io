import { describe, expect, it } from 'vitest'
import { getAvailableVisibleStatistics } from './gpxVisibleStatistics'
import type { GpxStatistics } from './gpxStatistics'

const base: GpxStatistics = { distanceMeters: 1000, fragmentCount: 1 }

describe('visible GPX statistics', () => {
  it('only enables statistics that have valid values', () => {
    expect([...getAvailableVisibleStatistics(base)]).toEqual(['distance'])
    expect([...getAvailableVisibleStatistics({ ...base, recordedTimeSeconds: 60, paceSecondsPerKm: 60, elevationGainMeters: 4, elevationLossMeters: 2, minimumElevationMeters: 10, maximumElevationMeters: 20, startTimeMs: 1, endTimeMs: 2 })]).toEqual(['distance', 'recordedTime', 'pace', 'elevationGain', 'elevationLoss', 'elevationRange', 'startTime', 'endTime'])
  })
})
