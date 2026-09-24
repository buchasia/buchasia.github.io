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
  it('uses the A4 portrait defaults', () => {
    expect(DEFAULT_ARTWORK_SETTINGS).toEqual({ orientation: 'portrait', size: 'a4', title: '', distanceUnit: 'metric' })
    expect(getArtworkDimensions(DEFAULT_ARTWORK_SETTINGS)).toEqual({ widthMm: 210, heightMm: 297, widthPx: 2480, heightPx: 3508 })
  })

  it('swaps physical and pixel dimensions for landscape layouts', () => {
    expect(getArtworkDimensions({ orientation: 'landscape', size: 'a3' })).toEqual({ widthMm: 420, heightMm: 297, widthPx: 4961, heightPx: 3508 })
    expect(getArtworkDimensions({ orientation: 'landscape', size: 'square' })).toEqual({ widthMm: 254, heightMm: 254, widthPx: 3000, heightPx: 3000 })
  })

  it('normalizes unsupported values and disables landscape for square output', () => {
    expect(normalizeArtworkSettings({ size: 'square', orientation: 'landscape', distanceUnit: 'imperial', title: 'Run' })).toEqual({ size: 'square', orientation: 'portrait', distanceUnit: 'imperial', title: 'Run' })
  })

  it('counts Unicode code points and validates title limits', () => {
    expect(getTitleCodePointCount('🏃‍♀️')).toBe(4)
    expect(validateArtworkTitle('a'.repeat(ARTWORK_LIMITS.maxTitleCodePoints))).toBeNull()
    expect(validateArtworkTitle('a'.repeat(ARTWORK_LIMITS.maxTitleCodePoints + 1))).toBe('titleTooLong')
    expect(validateArtworkTitle('one\ntwo\nthree')).toBe('titleTooManyLines')
  })
})
