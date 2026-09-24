import { parser as createXmlParser, type SAXOptions, type SAXParser, type Tag, type QualifiedTag } from 'sax'
import { GPX_LIMITS, GpxValidationError, type GpxActivity, type GpxSegment, type ValidatedGpx } from './gpxValidationTypes'

const gpxNamespaces = new Set([
  'http://www.topografix.com/GPX/1/0',
  'http://www.topografix.com/GPX/1/1',
])
// Phase 1 reads only the Garmin TrackPointExtension fields needed for heart rate and cadence.
// Other vendor extension fields are not interpreted or retained.
const trackPointExtensionNamespaces = new Set([
  'http://www.garmin.com/xmlschemas/TrackPointExtension/v1',
  'http://www.garmin.com/xmlschemas/TrackPointExtension/v2',
])
const clueTrustNamespace = 'http://www.cluetrust.com/XML/GPXDATA/1/0'

// SAX delivers a point's attributes and child elements at different times, so collect them
// here and emit the normalized GPX point only when its closing tag arrives.
type MutablePoint = {
  latitude: number
  longitude: number
  elevationText?: string
  timeText?: string
  heartRateText?: string
  cadenceText?: string
}

type Capture = {
  // One text element is captured at a time; MutablePoint accumulates all optional fields.
  tag: 'name' | 'ele' | 'time' | 'hr' | 'cad' | 'cadence'
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
  private readonly stack: Array<{
    name: string
    namespace: string
    isGpx: boolean
    isTrackPointExtension: boolean
    isTrackPointMetric: boolean
    isClueTrustMetric: boolean
  }> = []
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
    // SAX syntax errors become malformedXml; declarations that can load or define external
    // content are rejected separately as unsafeXml.
    this.xml.onerror = () => { throw new GpxValidationError('malformedXml') }
    // Reject DTDs so entity declarations or external DTD references cannot be used.
    this.xml.ondoctype = () => { throw new GpxValidationError('unsafeXml') }
    // SGML declarations are outside the accepted GPX/XML input profile too.
    this.xml.onsgmldeclaration = () => { throw new GpxValidationError('unsafeXml') }
    this.xml.onprocessinginstruction = (instruction) => {
      // Allow only an XML processing instruction outside elements; reject stylesheets and other PIs.
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
    // Match by namespace as well as local name so similarly named elements from other vendors
    // are not mistaken for Garmin metrics.
    const isTrackPointExtension = name === 'TrackPointExtension' && trackPointExtensionNamespaces.has(uri)
    const isTrackPointMetric = Boolean(
      parent?.isTrackPointExtension && parent.namespace === uri && (name === 'hr' || name === 'cad'),
    )
    const trackPoint = this.stack.at(-2)
    const isClueTrustMetric = Boolean(
      uri === clueTrustNamespace
      && (name === 'hr' || name === 'cadence')
      && parent?.name === 'extensions'
      && parent.namespace === this.rootNamespace
      && trackPoint?.name === 'trkpt'
      && trackPoint.namespace === this.rootNamespace,
    )

    if (this.depth >= GPX_LIMITS.maxXmlDepth) throw new GpxValidationError('xmlTooDeep')
    if (this.depth === 0) {
      if (name !== 'gpx' || !gpxNamespaces.has(uri)) throw new GpxValidationError('unsupportedGpx')
      this.rootNamespace = uri
    }

    // GPX elements must stay in the root GPX namespace; extension elements cannot impersonate them.
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
    } else if (isTrackPointMetric && this.currentPoint) {
      this.capture = { tag: name === 'hr' ? 'hr' : 'cad', chunks: [], point: this.currentPoint }
    } else if (isClueTrustMetric && this.currentPoint) {
      this.capture = { tag: name === 'hr' ? 'hr' : 'cadence', chunks: [], point: this.currentPoint }
    } else if (isGpx && name === 'name' && this.currentActivity && parent?.name === (this.currentActivity.kind === 'track' ? 'trk' : 'rte')) {
      this.capture = { tag: 'name', chunks: [], activity: this.currentActivity }
    }

    this.stack.push({ name, namespace: uri, isGpx, isTrackPointExtension, isTrackPointMetric, isClueTrustMetric })
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
    if ((current?.isGpx || current?.isTrackPointMetric || current?.isClueTrustMetric) && this.capture?.tag === name) {
      const text = this.capture.chunks.join('').trim()
      if (this.capture.point) {
        if (name === 'ele') this.capture.point.elevationText = text
        else if (name === 'time') this.capture.point.timeText = text
        else if (name === 'hr') this.capture.point.heartRateText = text
        else if (name === 'cad' || name === 'cadence') this.capture.point.cadenceText = text
      } else if (this.capture.activity && name === 'name' && text) {
        this.capture.activity.name = text
      }
      this.capture = undefined
    }

    // Invalid points are kept as null separators so later statistics/rendering cannot bridge a bad fix.
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
