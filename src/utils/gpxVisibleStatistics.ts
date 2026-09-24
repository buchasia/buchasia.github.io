import type { GpxStatistics } from './gpxStatistics'

export type GpxVisibleStatistic = 'distance' | 'recordedTime' | 'pace' | 'elevationGain' | 'elevationLoss' | 'elevationRange' | 'startTime' | 'endTime'

export const DEFAULT_VISIBLE_STATISTICS: GpxVisibleStatistic[] = ['distance', 'recordedTime', 'pace', 'elevationGain']

export const getAvailableVisibleStatistics = (stats: GpxStatistics): Set<GpxVisibleStatistic> => {
  const available = new Set<GpxVisibleStatistic>(['distance'])
  if (stats.recordedTimeSeconds !== undefined) available.add('recordedTime')
  if (stats.paceSecondsPerKm !== undefined) available.add('pace')
  if (stats.elevationGainMeters !== undefined) available.add('elevationGain')
  if (stats.elevationLossMeters !== undefined) available.add('elevationLoss')
  if (stats.minimumElevationMeters !== undefined && stats.maximumElevationMeters !== undefined) available.add('elevationRange')
  if (stats.startTimeMs !== undefined) available.add('startTime')
  if (stats.endTimeMs !== undefined) available.add('endTime')
  return available
}
