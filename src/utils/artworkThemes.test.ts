import { describe, expect, it } from 'vitest'
import { ARTWORK_THEMES, DEFAULT_ARTWORK_THEME, contrastRatio, getArtworkTheme, hasReadableThemeContrast } from './artworkThemes'

describe('artwork themes', () => {
  it('contains the three stable Phase 1 palettes', () => {
    expect(Object.keys(ARTWORK_THEMES)).toEqual(['paper', 'night', 'botanical'])
    expect(ARTWORK_THEMES.paper).toMatchObject({ background: '#FFFFFF', routeColor: '#B91C1C', textColor: '#171717' })
    expect(ARTWORK_THEMES.night).toMatchObject({ background: '#151719', routeColor: '#5EEAD4', textColor: '#F7F7F7' })
    expect(ARTWORK_THEMES.botanical).toMatchObject({ background: '#F5FAF6', routeColor: '#276749', textColor: '#163B2B' })
    expect(DEFAULT_ARTWORK_THEME).toBe('paper')
  })

  it('keeps text and route contrast readable', () => {
    Object.values(ARTWORK_THEMES).forEach(theme => {
      expect(hasReadableThemeContrast(theme)).toBe(true)
      expect(contrastRatio(theme.textColor, theme.background)).toBeGreaterThanOrEqual(4.5)
    })
  })

  it('falls back to Paper for unknown theme values', () => {
    expect(getArtworkTheme('unknown').id).toBe('paper')
  })
})
