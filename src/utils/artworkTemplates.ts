import { localizeTemplateText, validateArtworkTemplateDefinition, type ArtworkTemplateDefinition } from './artworkTemplateDefinition'

export type ArtworkTemplateId = string

export type ArtworkTemplate = {
  id: ArtworkTemplateId
  label: string
  description: string
  definition: ArtworkTemplateDefinition
}

const definitionModules = import.meta.glob('../data/artwork-templates/*.template.json', { eager: true, import: 'default' }) as Record<string, unknown>
const definitions = Object.values(definitionModules)
if (definitions.some(definition => !validateArtworkTemplateDefinition(definition))) throw new Error('Invalid bundled artwork template definition.')
if (!definitions.length) throw new Error('No bundled artwork template definitions found.')

export const ARTWORK_TEMPLATE_DEFINITIONS = definitions as ArtworkTemplateDefinition[]
export const ARTWORK_TEMPLATES: Record<ArtworkTemplateId, ArtworkTemplate> = Object.fromEntries(ARTWORK_TEMPLATE_DEFINITIONS.map(definition => [definition.id, {
  id: definition.id as ArtworkTemplateId,
  label: localizeTemplateText(definition.name, 'en'),
  description: localizeTemplateText(definition.description, 'en'),
  definition,
}])) as Record<ArtworkTemplateId, ArtworkTemplate>

export const DEFAULT_ARTWORK_TEMPLATE: ArtworkTemplateId = 'classic'

export const getArtworkTemplate = (id: string | undefined) => ARTWORK_TEMPLATES[id as ArtworkTemplateId] ?? ARTWORK_TEMPLATES[DEFAULT_ARTWORK_TEMPLATE]
