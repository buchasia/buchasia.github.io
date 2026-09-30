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
      { metric: 'distance', currentYear: '2026', currentValue: 100, targetYear: '2023', targetValue: 120, remaining: 20, progress: (100 / 120) * 100, surpassedYears: 0, earlierYears: 3 },
      { metric: 'duration', currentYear: '2026', currentValue: 1000, targetYear: '2025', targetValue: 1100, remaining: 100, progress: (1000 / 1100) * 100, surpassedYears: 1, earlierYears: 3 },
      { metric: 'totalAscent', currentYear: '2026', currentValue: 50, targetYear: '2023', targetValue: 60, remaining: 10, progress: (50 / 60) * 100, surpassedYears: 0, earlierYears: 3 },
    ])
  })

  it('returns a no-target result when no earlier year is higher', () => {
    const result = getYearlyHistoricalProgress(yearlyData, '2024')
    expect(result[0]).toMatchObject({ metric: 'distance', targetYear: null, targetValue: null, remaining: null, progress: null, surpassedYears: 1, earlierYears: 1 })
  })

  it('does not count equal historical values as surpassed', () => {
    const result = getYearlyHistoricalProgress({
      '2026': { distance: 100, duration: 100, totalAscent: 100, count: 1 },
      '2025': { distance: 100, duration: 90, totalAscent: 100, count: 1 },
    }, '2026')
    expect(result).toEqual([
      expect.objectContaining({ metric: 'distance', surpassedYears: 0, earlierYears: 1 }),
      expect.objectContaining({ metric: 'duration', surpassedYears: 1, earlierYears: 1 }),
      expect.objectContaining({ metric: 'totalAscent', surpassedYears: 0, earlierYears: 1 }),
    ])
  })

  it('counts every earlier year when the current year is highest', () => {
    const result = getYearlyHistoricalProgress({
      '2026': { distance: 300, duration: 300, totalAscent: 300, count: 1 },
      '2025': { distance: 100, duration: 100, totalAscent: 100, count: 1 },
      '2024': { distance: 200, duration: 200, totalAscent: 200, count: 1 },
    }, '2026')
    expect(result).toEqual([
      expect.objectContaining({ surpassedYears: 2, earlierYears: 2, targetYear: null }),
      expect.objectContaining({ surpassedYears: 2, earlierYears: 2, targetYear: null }),
      expect.objectContaining({ surpassedYears: 2, earlierYears: 2, targetYear: null }),
    ])
  })

  it('returns zero counts when there are no earlier years', () => {
    const result = getYearlyHistoricalProgress(yearlyData, '2023')
    expect(result.every(item => item.surpassedYears === 0 && item.earlierYears === 0)).toBe(true)
  })
})
