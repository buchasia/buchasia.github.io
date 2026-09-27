import { describe, expect, it } from 'vitest'
import stats from '../data/artwork-templates/stats.template.json'
import { validateArtworkTemplateDefinition } from './artworkTemplateDefinition'

describe('artwork template definitions', () => {
  it('accepts bundled definitions and their per-element shadows', () => {
    expect(validateArtworkTemplateDefinition(stats)).toBe(true)
  })

  it('rejects unsupported paths and invalid shadow values', () => {
    const invalid = structuredClone(stats) as Record<string, unknown>
    const settings = invalid.settings as Record<string, unknown>
    const shadows = settings.shadows as Record<string, Record<string, unknown>>
    shadows.statistics.opacity = 2
    expect(validateArtworkTemplateDefinition(invalid)).toBe(false)

    shadows.statistics.opacity = 0.2
    const editor = invalid.editor as Array<Record<string, unknown>>
    editor.push({ id: 'unsafe', type: 'text', path: '__proto__.polluted', label: 'Unsafe', maxLength: 10 })
    expect(validateArtworkTemplateDefinition(invalid)).toBe(false)
  })

  it('rejects invalid visible statistic keys', () => {
    const invalid = structuredClone(stats) as Record<string, unknown>
    const layout = invalid.layout as Record<string, unknown>
    const statistics = layout.statistics as Record<string, unknown>
    statistics.visibleStatistics = ['distance', 'not-a-statistic']
    expect(validateArtworkTemplateDefinition(invalid)).toBe(false)
  })

  it('rejects unsupported output dimensions', () => {
    const invalid = structuredClone(stats) as Record<string, unknown>
    const output = invalid.output as Record<string, unknown>
    output.widthPx = 100
    expect(validateArtworkTemplateDefinition(invalid)).toBe(false)
  })

  it('requires a localized output size description', () => {
    const invalid = structuredClone(stats) as Record<string, unknown>
    const output = invalid.output as Record<string, unknown>
    delete output.sizeDescription
    expect(validateArtworkTemplateDefinition(invalid)).toBe(false)
  })
})
