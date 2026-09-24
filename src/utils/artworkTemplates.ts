export type ArtworkTemplateId = 'classic' | 'minimal' | 'stats'

export type ArtworkTemplate = {
  id: ArtworkTemplateId
  label: string
  description: string
  routePadding: number
  titleY: number
  statisticsY: number
  statisticsColumns: 1 | 2
}

export const ARTWORK_TEMPLATES: Record<ArtworkTemplateId, ArtworkTemplate> = {
  classic: { id: 'classic', label: 'Classic', description: 'Centered route with title and footer statistics.', routePadding: 180, titleY: 0.16, statisticsY: 0.86, statisticsColumns: 2 },
  minimal: { id: 'minimal', label: 'Minimal', description: 'Route-dominant composition with generous whitespace.', routePadding: 300, titleY: 0.12, statisticsY: 0.91, statisticsColumns: 2 },
  stats: { id: 'stats', label: 'Stats', description: 'Route above a structured statistics section.', routePadding: 140, titleY: 0.12, statisticsY: 0.72, statisticsColumns: 2 },
}

export const DEFAULT_ARTWORK_TEMPLATE: ArtworkTemplateId = 'classic'

export const getArtworkTemplate = (id: string | undefined) => ARTWORK_TEMPLATES[id as ArtworkTemplateId] ?? ARTWORK_TEMPLATES[DEFAULT_ARTWORK_TEMPLATE]
