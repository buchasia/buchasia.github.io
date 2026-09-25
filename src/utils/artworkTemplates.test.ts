import { describe, expect, it } from 'vitest'
import { ARTWORK_TEMPLATES, DEFAULT_ARTWORK_TEMPLATE, getArtworkTemplate } from './artworkTemplates'

describe('artwork templates', () => {
  it('defines the three initial compositions and the Classic default', () => {
    expect(Object.keys(ARTWORK_TEMPLATES)).toEqual(['classic', 'minimal', 'stats'])
    expect(DEFAULT_ARTWORK_TEMPLATE).toBe('classic')
    expect(ARTWORK_TEMPLATES.classic.statisticsColumns).toBe(2)
    expect(new Set(Object.values(ARTWORK_TEMPLATES).map(template => template.composition))).toEqual(new Set(['classic', 'minimal', 'stats']))
  })

  it('falls back safely for unknown values', () => {
    expect(getArtworkTemplate('unknown').id).toBe('classic')
  })
})
