import { describe, expect, it } from 'vitest'
import {
  ARTWORK_LIMITS,
  DEFAULT_ARTWORK_SETTINGS,
  getTitleCodePointCount,
  normalizeArtworkSettings,
  validateArtworkTitle,
} from './artworkSettings'

describe('artwork settings', () => {
  it('uses the default artwork settings', () => {
    expect(DEFAULT_ARTWORK_SETTINGS).toEqual({ title: '', distanceUnit: 'metric' })
  })

  it('normalizes unsupported settings', () => {
    expect(normalizeArtworkSettings({ distanceUnit: 'imperial', title: 'Run' })).toEqual({ distanceUnit: 'imperial', title: 'Run' })
  })

  it('counts Unicode code points and validates title limits', () => {
    expect(getTitleCodePointCount('🏃‍♀️')).toBe(4)
    expect(validateArtworkTitle('a'.repeat(ARTWORK_LIMITS.maxTitleCodePoints))).toBeNull()
    expect(validateArtworkTitle('a'.repeat(ARTWORK_LIMITS.maxTitleCodePoints + 1))).toBe('titleTooLong')
    expect(validateArtworkTitle('one\ntwo\nthree')).toBe('titleTooManyLines')
  })
})
