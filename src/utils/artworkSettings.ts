export type ArtworkOrientation = 'portrait' | 'landscape'
export type ArtworkSize = 'a4' | 'a3' | 'square'
export type DistanceUnit = 'metric' | 'imperial'

export type ArtworkSettings = {
  orientation: ArtworkOrientation
  size: ArtworkSize
  title: string
  distanceUnit: DistanceUnit
}

export type ArtworkDimensions = {
  widthMm: number
  heightMm: number
  widthPx: number
  heightPx: number
}

export type ArtworkSettingsError = 'titleTooLong' | 'titleTooManyLines' | 'titleDoesNotFit'

export const ARTWORK_LIMITS = {
  maxTitleCodePoints: 80,
  maxTitleLines: 2,
} as const

const dimensions: Record<ArtworkSize, ArtworkDimensions> = {
  a4: { widthMm: 210, heightMm: 297, widthPx: 2480, heightPx: 3508 },
  a3: { widthMm: 297, heightMm: 420, widthPx: 3508, heightPx: 4961 },
  square: { widthMm: 254, heightMm: 254, widthPx: 3000, heightPx: 3000 },
}

export const DEFAULT_ARTWORK_SETTINGS: ArtworkSettings = {
  orientation: 'portrait',
  size: 'a4',
  title: '',
  distanceUnit: 'metric',
}

export const getArtworkDimensions = ({ orientation, size }: Pick<ArtworkSettings, 'orientation' | 'size'>): ArtworkDimensions => {
  const base = dimensions[size]
  if (size === 'square' || orientation === 'portrait') return { ...base }
  return { widthMm: base.heightMm, heightMm: base.widthMm, widthPx: base.heightPx, heightPx: base.widthPx }
}

export const getTitleCodePointCount = (title: string) => Array.from(title).length

export const validateArtworkTitle = (title: string): ArtworkSettingsError | null => {
  if (getTitleCodePointCount(title) > ARTWORK_LIMITS.maxTitleCodePoints) return 'titleTooLong'
  if (title.split(/\r?\n/).length > ARTWORK_LIMITS.maxTitleLines) return 'titleTooManyLines'
  return null
}

export const normalizeArtworkSettings = (settings: Partial<ArtworkSettings> = {}): ArtworkSettings => {
  const size = settings.size === 'a3' || settings.size === 'square' ? settings.size : 'a4'
  const orientation = settings.orientation === 'landscape' && size !== 'square' ? 'landscape' : 'portrait'
  const distanceUnit = settings.distanceUnit === 'imperial' ? 'imperial' : 'metric'
  const title = typeof settings.title === 'string' ? settings.title : ''
  return { orientation, size, distanceUnit, title }
}

export const getArtworkSizeLabel = (size: ArtworkSize) => ({ a4: 'A4', a3: 'A3', square: 'Square' })[size]
