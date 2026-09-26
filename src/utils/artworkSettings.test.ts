import { describe, expect, it } from 'vitest'
import {
  ARTWORK_LIMITS,
  DEFAULT_ARTWORK_SETTINGS,
  getArtworkDimensions,
  getTitleCodePointCount,
  normalizeArtworkSettings,
  validateArtworkTitle,
} from './artworkSettings'

describe('artwork settings', () => {
  it('uses the default pixel dimensions', () => {
    expect(DEFAULT_ARTWORK_SETTINGS).toEqual({ widthPx: 2480, heightPx: 3508, title: '', distanceUnit: 'metric' })
    expect(getArtworkDimensions(DEFAULT_ARTWORK_SETTINGS)).toEqual({ widthPx: 2480, heightPx: 3508 })
  })

  it('uses custom pixel dimensions directly', () => {
    expect(getArtworkDimensions({ widthPx: 4000, heightPx: 2500 })).toEqual({ widthPx: 4000, heightPx: 2500 })
  })

  it('normalizes unsupported dimensions and settings', () => {
    expect(normalizeArtworkSettings({ widthPx: 100, heightPx: 20000, distanceUnit: 'imperial', title: 'Run' })).toEqual({ widthPx: 2480, heightPx: 3508, distanceUnit: 'imperial', title: 'Run' })
    expect(normalizeArtworkSettings({ widthPx: 4000.5, heightPx: 2500 })).toEqual({ widthPx: 2480, heightPx: 2500, distanceUnit: 'metric', title: '' })
  })

  it('counts Unicode code points and validates title limits', () => {
    expect(getTitleCodePointCount('🏃‍♀️')).toBe(4)
    expect(validateArtworkTitle('a'.repeat(ARTWORK_LIMITS.maxTitleCodePoints))).toBeNull()
    expect(validateArtworkTitle('a'.repeat(ARTWORK_LIMITS.maxTitleCodePoints + 1))).toBe('titleTooLong')
    expect(validateArtworkTitle('one\ntwo\nthree')).toBe('titleTooManyLines')
  })
})
