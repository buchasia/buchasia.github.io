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
})
