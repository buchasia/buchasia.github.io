import { describe, expect, it } from 'vitest'
import { ARTWORK_TEMPLATES, DEFAULT_ARTWORK_TEMPLATE, getArtworkTemplate } from './artworkTemplates'

describe('artwork templates', () => {
  it('loads the bundled templates and keeps Classic as the default', () => {
    expect(Object.keys(ARTWORK_TEMPLATES).length).toBeGreaterThanOrEqual(4)
    expect(DEFAULT_ARTWORK_TEMPLATE).toBe('classic')
    expect(ARTWORK_TEMPLATES.classic.definition.$schema).toBe('run-template-definition/v1')
    expect(ARTWORK_TEMPLATES.classic.definition.settings.shadows).toEqual({})
    expect(ARTWORK_TEMPLATES.stats.definition.settings.shadows).toMatchObject({ title: { enabled: true }, statistics: { enabled: true } })
    expect(ARTWORK_TEMPLATES['night-run'].definition.appearance.background).toMatchObject({ kind: 'linear-gradient' })
    Object.values(ARTWORK_TEMPLATES).forEach(template => expect(template.definition.layout.statistics.columns).toBeGreaterThan(0))
  })

  it('falls back safely for unknown values', () => {
    expect(getArtworkTemplate('unknown').id).toBe('classic')
  })
})
