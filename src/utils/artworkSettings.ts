export type DistanceUnit = 'metric' | 'imperial'

export type ArtworkSettings = {
  widthPx: number
  heightPx: number
  title: string
  distanceUnit: DistanceUnit
}

export type ArtworkDimensions = {
  widthPx: number
  heightPx: number
}

export type ArtworkSettingsError = 'titleTooLong' | 'titleTooManyLines' | 'titleDoesNotFit'

export const ARTWORK_LIMITS = {
  maxTitleCodePoints: 80,
  maxTitleLines: 2,
  minDimensionPx: 320,
  maxDimensionPx: 10000,
} as const

export const DEFAULT_ARTWORK_SETTINGS: ArtworkSettings = {
  widthPx: 2480,
  heightPx: 3508,
  title: '',
  distanceUnit: 'metric',
}

export const getArtworkDimensions = ({ widthPx, heightPx }: Pick<ArtworkSettings, 'widthPx' | 'heightPx'>): ArtworkDimensions => ({ widthPx, heightPx })

export const getTitleCodePointCount = (title: string) => Array.from(title).length

export const validateArtworkTitle = (title: string): ArtworkSettingsError | null => {
  if (getTitleCodePointCount(title) > ARTWORK_LIMITS.maxTitleCodePoints) return 'titleTooLong'
  if (title.split(/\r?\n/).length > ARTWORK_LIMITS.maxTitleLines) return 'titleTooManyLines'
  return null
}

export const normalizeArtworkSettings = (settings: Partial<ArtworkSettings> = {}): ArtworkSettings => {
  const normalizeDimension = (value: number | undefined, fallback: number) => typeof value === 'number' && Number.isInteger(value) && value >= ARTWORK_LIMITS.minDimensionPx && value <= ARTWORK_LIMITS.maxDimensionPx ? value : fallback
  const widthPx = normalizeDimension(settings.widthPx, DEFAULT_ARTWORK_SETTINGS.widthPx)
  const heightPx = normalizeDimension(settings.heightPx, DEFAULT_ARTWORK_SETTINGS.heightPx)
  const distanceUnit = settings.distanceUnit === 'imperial' ? 'imperial' : 'metric'
  const title = typeof settings.title === 'string' ? settings.title : ''
  return { widthPx, heightPx, distanceUnit, title }
}
