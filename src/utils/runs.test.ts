import { describe, expect, it } from 'vitest'
import { getRunDistanceDistribution, getRunDistributionDefaultYear, getRunningTargetPaceStatus, getRunningTargetSnapshots, getYearlyHistoricalProgress } from './runs'

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

describe('run distance distribution', () => {
  const run = (distance: number, date = '2026-01-01') => ({
    id: `${date}-${distance}`,
    date: new Date(`${date}T12:00:00Z`),
    distance,
    duration: 60,
  })

  it('assigns boundary values to the lower-inclusive bucket', () => {
    const result = getRunDistanceDistribution([
      run(1_999), run(2_000), run(4_999), run(5_000), run(9_999), run(10_000),
      run(20_999), run(21_000), run(29_999), run(30_000), run(41_999), run(42_000),
    ], '2026')
    expect(result.map(bucket => bucket.count)).toEqual([1, 2, 2, 2, 2, 2, 1])
    expect(result.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(12)
  })

  it('filters by UTC year, retains empty buckets, and calculates percentages', () => {
    const result = getRunDistanceDistribution([run(3_000), run(50_000), run(7_000, '2025-12-31')], '2026')
    expect(result).toHaveLength(7)
    expect(result.map(bucket => bucket.count)).toEqual([0, 1, 0, 0, 0, 0, 1])
    expect(result[1].percentage).toBe(50)
    expect(result[6].percentage).toBe(50)
  })

  it('returns zero counts and percentages for a year without runs', () => {
    const result = getRunDistanceDistribution([run(3_000)], '2025')
    expect(result.every(bucket => bucket.count === 0 && bucket.percentage === 0)).toBe(true)
  })

  it('defaults to the current year and falls back to the newest available year', () => {
    expect(getRunDistributionDefaultYear(['2026', '2025'], '2026')).toBe('2026')
    expect(getRunDistributionDefaultYear(['2025', '2024'], '2026')).toBe('2025')
    expect(getRunDistributionDefaultYear([], '2026')).toBe('2026')
  })
})

describe('running target pace', () => {
  const run = (date: string, distance: number) => ({
    id: `${date}-${distance}`,
    date: new Date(`${date}T12:00:00Z`),
    distance,
    duration: 60,
  })

  it('calculates active monthly progress from the previous milestone', () => {
    const target = getRunningTargetSnapshots([run('2026-01-15', 125_000)], new Date('2026-01-15T12:00:00Z'))
      .find(snapshot => snapshot.id === 'monthly-distance')!

    expect(target.previousTarget).toBe(100_000)
    expect(target.nextTarget).toBe(200_000)
    expect(target.progress).toBe(25)
    expect(target.expectedProgress).toBeCloseTo((15 / 31) * 100)
  })

  it('uses the correct number of days for leap-year targets', () => {
    const target = getRunningTargetSnapshots([], new Date('2024-02-29T12:00:00Z'))
      .find(snapshot => snapshot.id === 'yearly-distance')!

    expect(target.expectedProgress).toBeCloseTo((60 / 366) * 100)
  })

  it('classifies progress as behind, on, or ahead with a five-point tolerance', () => {
    expect(getRunningTargetPaceStatus(40, 50)).toBe('behind')
    expect(getRunningTargetPaceStatus(47, 50)).toBe('on')
    expect(getRunningTargetPaceStatus(60, 50)).toBe('ahead')
  })
})
