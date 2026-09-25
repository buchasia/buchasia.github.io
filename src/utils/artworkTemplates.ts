export type ArtworkTemplateId = 'classic' | 'minimal' | 'stats'
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
}

export const ARTWORK_TEMPLATES: Record<ArtworkTemplateId, ArtworkTemplate> = {
  classic: { id: 'classic', label: 'Classic', description: 'A balanced editorial route poster with a calm metric grid.', composition: 'classic', routePadding: 180, titleY: 0.16, statisticsY: 0.86, statisticsColumns: 2 },
  minimal: { id: 'minimal', label: 'Minimal', description: 'A route-first composition with quiet supporting metadata.', composition: 'minimal', routePadding: 300, titleY: 0.12, statisticsY: 0.91, statisticsColumns: 2 },
  stats: { id: 'stats', label: 'Stats', description: 'A metric-led poster with a prominent distance and supporting route.', composition: 'stats', routePadding: 140, titleY: 0.12, statisticsY: 0.72, statisticsColumns: 2 },
}

export const DEFAULT_ARTWORK_TEMPLATE: ArtworkTemplateId = 'classic'

export const getArtworkTemplate = (id: string | undefined) => ARTWORK_TEMPLATES[id as ArtworkTemplateId] ?? ARTWORK_TEMPLATES[DEFAULT_ARTWORK_TEMPLATE]
