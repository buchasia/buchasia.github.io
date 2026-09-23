export const GPX_LIMITS = {
  maxFileBytes: 20 * 1024 * 1024,
  maxActivities: 100,
  maxPoints: 100_000,
  maxSegments: 1_000,
  maxXmlDepth: 64,
  readChunkBytes: 64 * 1024,
} as const

export type GpxLocale = 'en' | 'de'

export type GpxValidationErrorCode =
  | 'unsupportedFile'
  | 'fileTooLarge'
  | 'emptyFile'
  | 'malformedXml'
  | 'unsafeXml'
  | 'unsupportedGpx'
  | 'tooManyActivities'
  | 'tooManyPoints'
  | 'tooManySegments'
  | 'xmlTooDeep'
  | 'noUsableCoordinates'
  | 'cancelled'

export class GpxValidationError extends Error {
  constructor(readonly code: GpxValidationErrorCode) {
    super(code)
    this.name = 'GpxValidationError'
  }
}

export type GpxPoint = {
  latitude: number
  longitude: number
  elevationText?: string
  timeText?: string
} | null

export type GpxSegment = {
  points: GpxPoint[]
}

export type GpxActivity = {
  kind: 'track' | 'route'
  name?: string
  segments: GpxSegment[]
}

export type ValidatedGpx = {
  activities: GpxActivity[]
  pointCount: number
  usablePointCount: number
  invalidCoordinateCount: number
}
