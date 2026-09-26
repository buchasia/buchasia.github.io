import { describe, expect, it } from 'vitest'
import { ARTWORK_TEMPLATES, DEFAULT_ARTWORK_TEMPLATE, getArtworkTemplate } from './artworkTemplates'

describe('artwork templates', () => {
  it('defines the three initial compositions and the Classic default', () => {
    expect(Object.keys(ARTWORK_TEMPLATES)).toEqual(['classic', 'minimal', 'stats', 'night-run'])
    expect(DEFAULT_ARTWORK_TEMPLATE).toBe('classic')
    expect(ARTWORK_TEMPLATES.classic.statisticsColumns).toBe(2)
    expect(new Set(Object.values(ARTWORK_TEMPLATES).map(template => template.composition))).toEqual(new Set(['classic', 'minimal', 'stats']))
    expect(ARTWORK_TEMPLATES.classic.definition.$schema).toBe('run-template-definition/v1')
    expect(ARTWORK_TEMPLATES.classic.definition.settings.shadows).toEqual({})
    expect(ARTWORK_TEMPLATES.stats.definition.settings.shadows).toMatchObject({ title: { enabled: true }, statistics: { enabled: true } })
    expect(ARTWORK_TEMPLATES['night-run'].appearance.background).toMatchObject({ kind: 'linear-gradient' })
  })

  it('falls back safely for unknown values', () => {
    expect(getArtworkTemplate('unknown').id).toBe('classic')
  })
})
