import classicDefinition from '../data/artwork-templates/classic.template.json'
import minimalDefinition from '../data/artwork-templates/minimal.template.json'
import statsDefinition from '../data/artwork-templates/stats.template.json'
import nightRunDefinition from '../data/artwork-templates/night-run.template.json'
import { localizeTemplateText, validateArtworkTemplateDefinition, type ArtworkTemplateDefinition } from './artworkTemplateDefinition'

export type ArtworkTemplateId = 'classic' | 'minimal' | 'stats' | 'night-run'
export type ArtworkTemplateComposition = 'classic' | 'minimal' | 'stats'

export type ArtworkTemplate = {
  id: ArtworkTemplateId
  label: string
  description: string
  composition: ArtworkTemplateComposition
  routePadding: number
  titleY: number
  statisticsY: number
  statisticsColumns: 1 | 2
  appearance: ArtworkTemplateDefinition['appearance']
  definition: ArtworkTemplateDefinition
}

const definitions = [classicDefinition, minimalDefinition, statsDefinition, nightRunDefinition]
if (definitions.some(definition => !validateArtworkTemplateDefinition(definition))) throw new Error('Invalid bundled artwork template definition.')

export const ARTWORK_TEMPLATE_DEFINITIONS = definitions as ArtworkTemplateDefinition[]
export const ARTWORK_TEMPLATES: Record<ArtworkTemplateId, ArtworkTemplate> = Object.fromEntries(ARTWORK_TEMPLATE_DEFINITIONS.map(definition => [definition.id, {
  id: definition.id as ArtworkTemplateId,
  label: localizeTemplateText(definition.name, 'en'),
  description: localizeTemplateText(definition.description, 'en'),
  composition: definition.composition,
  routePadding: definition.layout.routePadding,
  titleY: definition.composition === 'classic' ? 0.16 : definition.composition === 'minimal' ? 0.12 : 0.12,
  statisticsY: definition.composition === 'classic' ? 0.86 : definition.composition === 'minimal' ? 0.91 : 0.72,
  statisticsColumns: definition.layout.statisticsColumns,
  appearance: definition.appearance,
  definition,
}])) as Record<ArtworkTemplateId, ArtworkTemplate>

export const DEFAULT_ARTWORK_TEMPLATE: ArtworkTemplateId = 'classic'

export const getArtworkTemplate = (id: string | undefined) => ARTWORK_TEMPLATES[id as ArtworkTemplateId] ?? ARTWORK_TEMPLATES[DEFAULT_ARTWORK_TEMPLATE]
