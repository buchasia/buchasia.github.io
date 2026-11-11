export type DistanceUnit = 'metric' | 'imperial'

export type ArtworkSettings = {
  title: string
  distanceUnit: DistanceUnit
}

export type ArtworkSettingsError = 'titleTooLong' | 'titleTooManyLines' | 'titleDoesNotFit'

export const ARTWORK_LIMITS = {
  maxTitleCodePoints: 80,
  maxTitleLines: 2,
} as const

export const DEFAULT_ARTWORK_SETTINGS: ArtworkSettings = {
  title: '',
  distanceUnit: 'metric',
}

export const getTitleCodePointCount = (title: string) => Array.from(title).length

export const validateArtworkTitle = (title: string): ArtworkSettingsError | null => {
  if (getTitleCodePointCount(title) > ARTWORK_LIMITS.maxTitleCodePoints) return 'titleTooLong'
  if (title.split(/\r?\n/).length > ARTWORK_LIMITS.maxTitleLines) return 'titleTooManyLines'
  return null
}

export const normalizeArtworkSettings = (settings: Partial<ArtworkSettings> = {}): ArtworkSettings => {
  const distanceUnit = settings.distanceUnit === 'imperial' ? 'imperial' : 'metric'
  const title = typeof settings.title === 'string' ? settings.title : ''
  return { distanceUnit, title }
}
