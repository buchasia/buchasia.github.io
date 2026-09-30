import { describe, expect, it } from 'vitest'
import { getYearlyHistoricalProgress } from './runs'

const yearlyData = {
  '2026': { distance: 100, duration: 1000, totalAscent: 50, count: 1 },
  '2025': { distance: 130, duration: 1100, totalAscent: 70, count: 1 },
  '2024': { distance: 200, duration: 900, totalAscent: 120, count: 1 },
  '2023': { distance: 120, duration: 2000, totalAscent: 60, count: 1 },
}

describe('yearly historical progress', () => {
  it('selects the closest higher value from an earlier year per metric', () => {
    expect(getYearlyHistoricalProgress(yearlyData, '2026')).toEqual([
      { metric: 'distance', currentYear: '2026', currentValue: 100, targetYear: '2023', targetValue: 120, remaining: 20, progress: (100 / 120) * 100 },
      { metric: 'duration', currentYear: '2026', currentValue: 1000, targetYear: '2025', targetValue: 1100, remaining: 100, progress: (1000 / 1100) * 100 },
      { metric: 'totalAscent', currentYear: '2026', currentValue: 50, targetYear: '2023', targetValue: 60, remaining: 10, progress: (50 / 60) * 100 },
    ])
  })

  it('returns a no-target result when no earlier year is higher', () => {
    const result = getYearlyHistoricalProgress(yearlyData, '2024')
    expect(result[0]).toMatchObject({ metric: 'distance', targetYear: null, targetValue: null, remaining: null, progress: null })
  })
})
