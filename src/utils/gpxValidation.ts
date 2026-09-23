import { parser as createXmlParser, type SAXOptions, type SAXParser, type Tag, type QualifiedTag } from 'sax'

export const GPX_LIMITS = {
  maxFileBytes: 20 * 1024 * 1024,
  maxActivities: 100,
  maxPoints: 100_000,
  maxSegments: 1_000,
  maxXmlDepth: 64,
  readChunkBytes: 64 * 1024,
} as const

const gpxNamespaces = new Set([
  'http://www.topografix.com/GPX/1/0',
  'http://www.topografix.com/GPX/1/1',
])

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

type MutablePoint = {
  latitude: number
  longitude: number
  elevationText?: string
  timeText?: string
}

type Capture = {
  tag: 'name' | 'ele' | 'time'
  chunks: string[]
  point?: MutablePoint
  activity?: GpxActivity
}

function localName(tag: Tag | QualifiedTag) {
  return 'local' in tag ? tag.local : tag.name
}

function namespace(tag: Tag | QualifiedTag) {
  return 'uri' in tag ? tag.uri : ''
}

function attribute(tag: Tag | QualifiedTag, name: string) {
  const value = tag.attributes[name]
  return typeof value === 'string' ? value : value?.value
}

export class GpxStreamValidator {
  private readonly xml: SAXParser
  private readonly stack: Array<{ name: string; isGpx: boolean }> = []
  private readonly activities: GpxActivity[] = []
  private rootNamespace = ''
  private currentActivity: GpxActivity | undefined
  private currentSegment: GpxSegment | undefined
  private currentPoint: MutablePoint | undefined
  private capture: Capture | undefined
  private depth = 0
  private segments = 0
  private pointCountValue = 0
  private usablePointCount = 0
  private invalidCoordinateCount = 0
  private finished = false
  private sawNonWhitespaceText = false

  constructor() {
    this.xml = createXmlParser(true, { xmlns: true, strictEntities: true } as SAXOptions & { strictEntities: boolean })
    this.xml.onerror = () => { throw new GpxValidationError('malformedXml') }
    this.xml.ondoctype = () => { throw new GpxValidationError('unsafeXml') }
    this.xml.onsgmldeclaration = () => { throw new GpxValidationError('unsafeXml') }
    this.xml.onprocessinginstruction = (instruction) => {
      if (instruction.name.toLowerCase() !== 'xml' || this.depth > 0) {
        throw new GpxValidationError('unsafeXml')
      }
    }
    this.xml.onopentag = tag => this.open(tag)
    this.xml.ontext = text => {
      if (text.trim()) this.sawNonWhitespaceText = true
      this.capture?.chunks.push(text)
    }
    this.xml.oncdata = text => { this.capture?.chunks.push(text) }
    this.xml.onclosetag = name => this.close(name)
  }

  write(chunk: string) {
    if (this.finished) throw new Error('Cannot write after GPX parsing has finished')
    this.xml.write(chunk)
  }

  finish(): ValidatedGpx {
    if (this.finished) throw new Error('GPX parsing has already finished')
    this.finished = true
    this.xml.close()
    if (this.depth !== 0) throw new GpxValidationError('malformedXml')
    if (!this.rootNamespace) {
      throw new GpxValidationError(this.sawNonWhitespaceText ? 'unsupportedGpx' : 'emptyFile')
    }
    if (this.usablePointCount === 0) throw new GpxValidationError('noUsableCoordinates')

    return {
      activities: this.activities,
      pointCount: this.pointCountValue,
      usablePointCount: this.usablePointCount,
      invalidCoordinateCount: this.invalidCoordinateCount,
    }
  }

  private open(tag: Tag | QualifiedTag) {
    const name = localName(tag)
    const uri = namespace(tag)
    const parent = this.stack.at(-1)

    if (this.depth >= GPX_LIMITS.maxXmlDepth) throw new GpxValidationError('xmlTooDeep')
    if (this.depth === 0) {
      if (name !== 'gpx' || !gpxNamespaces.has(uri)) throw new GpxValidationError('unsupportedGpx')
      this.rootNamespace = uri
    }

    const isGpx = uri === this.rootNamespace && Boolean(this.rootNamespace)
    if (isGpx && this.depth === 1 && (name === 'trk' || name === 'rte')) {
      if (this.activities.length >= GPX_LIMITS.maxActivities) {
        throw new GpxValidationError('tooManyActivities')
      }
      this.currentActivity = { kind: name === 'trk' ? 'track' : 'route', segments: [] }
      this.activities.push(this.currentActivity)
      if (name === 'rte') this.addSegment()
    } else if (isGpx && name === 'trkseg' && this.currentActivity?.kind === 'track') {
      this.addSegment()
    } else if (isGpx && name === 'trkpt' && parent?.name === 'trkseg' && this.currentActivity?.kind === 'track') {
      this.startPoint(tag)
    } else if (isGpx && name === 'rtept' && parent?.name === 'rte' && this.currentActivity?.kind === 'route') {
      this.startPoint(tag)
    } else if (isGpx && this.currentPoint && (name === 'ele' || name === 'time')) {
      this.capture = { tag: name, chunks: [], point: this.currentPoint }
    } else if (isGpx && name === 'name' && this.currentActivity && parent?.name === (this.currentActivity.kind === 'track' ? 'trk' : 'rte')) {
      this.capture = { tag: 'name', chunks: [], activity: this.currentActivity }
    }

    this.stack.push({ name, isGpx })
    this.depth += 1
  }

  private addSegment() {
    if (this.segments >= GPX_LIMITS.maxSegments) throw new GpxValidationError('tooManySegments')
    this.segments += 1
    this.currentSegment = { points: [] }
    this.currentActivity?.segments.push(this.currentSegment)
  }

  private startPoint(tag: Tag | QualifiedTag) {
    if (!this.currentSegment) return
    if (this.pointCountValue >= GPX_LIMITS.maxPoints) throw new GpxValidationError('tooManyPoints')
    this.pointCountValue += 1
    const latitudeText = attribute(tag, 'lat')?.trim()
    const longitudeText = attribute(tag, 'lon')?.trim()
    const latitude = latitudeText ? Number(latitudeText) : Number.NaN
    const longitude = longitudeText ? Number(longitudeText) : Number.NaN
    this.currentPoint = {
      latitude: Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 ? latitude : Number.NaN,
      longitude: Number.isFinite(longitude) && longitude >= -180 && longitude <= 180 ? longitude : Number.NaN,
    }
  }

  private close(rawName: string) {
    const name = rawName.includes(':') ? rawName.slice(rawName.lastIndexOf(':') + 1) : rawName
    const current = this.stack.at(-1)
    if (current?.isGpx && this.capture?.tag === name) {
      const text = this.capture.chunks.join('').trim()
      if (this.capture.point && (name === 'ele' || name === 'time')) {
        if (name === 'ele') this.capture.point.elevationText = text
        else this.capture.point.timeText = text
      } else if (this.capture.activity && name === 'name' && text) {
        this.capture.activity.name = text
      }
      this.capture = undefined
    }

    if (current?.isGpx && (name === 'trkpt' || name === 'rtept') && this.currentPoint) {
      const { latitude, longitude, ...metadata } = this.currentPoint
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        this.currentSegment?.points.push({ latitude, longitude, ...metadata })
        this.usablePointCount += 1
      } else {
        this.currentSegment?.points.push(null)
        this.invalidCoordinateCount += 1
      }
      this.currentPoint = undefined
      this.capture = undefined
    }
    if (current?.isGpx && name === 'trkseg') this.currentSegment = undefined
    if (current?.isGpx && (name === 'trk' || name === 'rte')) {
      this.currentActivity = undefined
      this.currentSegment = undefined
    }

    this.stack.pop()
    this.depth -= 1
  }
}

export function validateGpxFileMetadata(name: string, size: number) {
  if (!/\.gpx$/i.test(name)) throw new GpxValidationError('unsupportedFile')
  if (size > GPX_LIMITS.maxFileBytes) throw new GpxValidationError('fileTooLarge')
  if (size === 0) throw new GpxValidationError('emptyFile')
}

export async function parseGpxFile(
  file: File,
  signal?: AbortSignal,
): Promise<ValidatedGpx> {
  validateGpxFileMetadata(file.name, file.size)
  const validator = new GpxStreamValidator()
  const decoder = new TextDecoder('utf-8', { fatal: true })

  try {
    for (let offset = 0; offset < file.size; offset += GPX_LIMITS.readChunkBytes) {
      if (signal?.aborted) throw new GpxValidationError('cancelled')
      const end = Math.min(offset + GPX_LIMITS.readChunkBytes, file.size)
      const bytes = await file.slice(offset, end).arrayBuffer()
      validator.write(decoder.decode(bytes, { stream: end < file.size }))
    }
    validator.write(decoder.decode())
    if (signal?.aborted) throw new GpxValidationError('cancelled')
    return validator.finish()
  } catch (error) {
    if (error instanceof GpxValidationError) throw error
    if (signal?.aborted) throw new GpxValidationError('cancelled')
    throw new GpxValidationError('malformedXml')
  }
}

const messages: Record<GpxLocale, Record<GpxValidationErrorCode, string>> = {
  en: {
    unsupportedFile: 'Choose a GPX file ending in .gpx.',
    fileTooLarge: 'This GPX file is larger than the 20 MiB limit.',
    emptyFile: 'This GPX file is empty.',
    malformedXml: 'This file is not valid GPX XML.',
    unsafeXml: 'This GPX file contains unsupported XML declarations or instructions.',
    unsupportedGpx: 'This file does not have a supported GPX 1.0 or 1.1 structure.',
    tooManyActivities: 'This GPX file contains more than 100 tracks or routes.',
    tooManyPoints: 'This GPX file contains more than 100,000 track or route points.',
    tooManySegments: 'This GPX file contains more than 1,000 segments.',
    xmlTooDeep: 'This GPX file has XML nested deeper than the supported limit.',
    noUsableCoordinates: 'This GPX file contains no usable track or route coordinates.',
    cancelled: 'GPX processing was cancelled.',
  },
  de: {
    unsupportedFile: 'Wähle eine GPX-Datei mit der Endung .gpx aus.',
    fileTooLarge: 'Diese GPX-Datei überschreitet die Größenbegrenzung von 20 MiB.',
    emptyFile: 'Diese GPX-Datei ist leer.',
    malformedXml: 'Diese Datei enthält kein gültiges GPX-XML.',
    unsafeXml: 'Diese GPX-Datei enthält nicht unterstützte XML-Deklarationen oder Anweisungen.',
    unsupportedGpx: 'Diese Datei hat keine unterstützte GPX-1.0- oder GPX-1.1-Struktur.',
    tooManyActivities: 'Diese GPX-Datei enthält mehr als 100 Tracks oder Routen.',
    tooManyPoints: 'Diese GPX-Datei enthält mehr als 100.000 Track- oder Routenpunkte.',
    tooManySegments: 'Diese GPX-Datei enthält mehr als 1.000 Segmente.',
    xmlTooDeep: 'Diese GPX-Datei überschreitet die zulässige XML-Verschachtelungstiefe.',
    noUsableCoordinates: 'Diese GPX-Datei enthält keine verwendbaren Track- oder Routenkoordinaten.',
    cancelled: 'Die GPX-Verarbeitung wurde abgebrochen.',
  },
}

export function getGpxValidationMessage(code: GpxValidationErrorCode, locale: GpxLocale) {
  return messages[locale][code]
}

export function getInvalidCoordinateWarning(count: number, locale: GpxLocale) {
  return locale === 'de'
    ? count === 1
      ? '1 ungültige Koordinate wurde verworfen; die Route wird an dieser Stelle unterbrochen.'
      : `${count} ungültige Koordinaten wurden verworfen; die Route wird an diesen Stellen unterbrochen.`
    : `${count} invalid coordinate${count === 1 ? ' was' : 's were'} discarded; the route is split at those points.`
}
