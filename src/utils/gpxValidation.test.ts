import { describe, expect, it } from 'vitest'
import { GPX_LIMITS, GpxValidationError, type GpxValidationErrorCode } from './gpxValidationTypes'
import { GpxStreamValidator } from './gpxStreamValidator'
import { parseGpxFile, validateGpxFileMetadata } from './gpxFileParser'
import { getGpxValidationMessage, getInvalidCoordinateWarning } from './gpxValidationMessages'

const ns = 'http://www.topografix.com/GPX/1/1'
const errorCodes: GpxValidationErrorCode[] = [
  'unsupportedFile', 'fileTooLarge', 'emptyFile', 'malformedXml', 'unsafeXml', 'unsupportedGpx',
  'tooManyActivities', 'tooManyPoints', 'tooManySegments', 'xmlTooDeep', 'noUsableCoordinates', 'cancelled',
]

function parse(xml: string) {
  const validator = new GpxStreamValidator()
  for (let offset = 0; offset < xml.length; offset += 17) {
    validator.write(xml.slice(offset, offset + 17))
  }
  return validator.finish()
}

function trackXml(points: string, inner = '') {
  return `<gpx xmlns="${ns}" version="1.1"><trk><name>Morning run</name><trkseg>${points}${inner}</trkseg></trk></gpx>`
}

function point(lat = '52.5', lon = '13.4', metadata = '') {
  return `<trkpt lat="${lat}" lon="${lon}">${metadata}</trkpt>`
}

function expectCode(run: () => unknown, code: GpxValidationErrorCode) {
  try {
    run()
    throw new Error(`Expected ${code}`)
  } catch (error) {
    expect(error).toBeInstanceOf(GpxValidationError)
    expect((error as GpxValidationError).code).toBe(code)
  }
}

describe('GPX input bounds', () => {
  it('checks extension, size, and empty input before reading', () => {
    expect(() => validateGpxFileMetadata('route.GPX', GPX_LIMITS.maxFileBytes)).not.toThrow()
    expectCode(() => validateGpxFileMetadata('route.xml', 1), 'unsupportedFile')
    expectCode(() => validateGpxFileMetadata('route.gpx', GPX_LIMITS.maxFileBytes + 1), 'fileTooLarge')
    expectCode(() => validateGpxFileMetadata('route.gpx', 0), 'emptyFile')
  })

  it('rejects an oversized file without invoking its reader', async () => {
    const slice = () => { throw new Error('The file should not be read') }
    const file = { name: 'large.gpx', size: GPX_LIMITS.maxFileBytes + 1, slice } as unknown as File
    await expect(parseGpxFile(file)).rejects.toMatchObject({ code: 'fileTooLarge' })
  })

  it('decodes UTF-8 across chunk boundaries and rejects invalid byte sequences', async () => {
    const prefix = `<gpx xmlns="${ns}" version="1.1"><trk><name>`
    const padding = 'a'.repeat(GPX_LIMITS.readChunkBytes - prefix.length - 1)
    const xml = `${prefix}${padding}é</name><trkseg>${point()}</trkseg></trk></gpx>`
    const validFile = new File([new TextEncoder().encode(xml)], 'route.gpx')
    const result = await parseGpxFile(validFile)
    expect(result.activities[0]?.name).toBe(`${padding}é`)

    const invalidBytes = new TextEncoder().encode(trackXml(point()))
    const malformedUtf8 = new Uint8Array(invalidBytes.length + 1)
    malformedUtf8.set(invalidBytes.subarray(0, 10))
    malformedUtf8[10] = 0xff
    malformedUtf8.set(invalidBytes.subarray(10), 11)
    const invalidFile = new File([malformedUtf8], 'route.gpx')
    await expect(parseGpxFile(invalidFile)).rejects.toMatchObject({ code: 'malformedXml' })
  })

  it('enforces activity, segment, point, and XML-depth limits during streaming', () => {
    const activities = Array.from({ length: GPX_LIMITS.maxActivities + 1 }, () =>
      `<trk><trkseg>${point()}</trkseg></trk>`).join('')
    expectCode(() => parse(`<gpx xmlns="${ns}">${activities}</gpx>`), 'tooManyActivities')

    const segments = Array.from({ length: GPX_LIMITS.maxSegments + 1 }, () =>
      `<trkseg>${point()}</trkseg>`).join('')
    expectCode(() => parse(`<gpx xmlns="${ns}"><trk>${segments}</trk></gpx>`), 'tooManySegments')

    const points = point().repeat(GPX_LIMITS.maxPoints + 1)
    expectCode(() => parse(trackXml(points)), 'tooManyPoints')

    const deep = `<gpx xmlns="${ns}">${'<x>'.repeat(GPX_LIMITS.maxXmlDepth)}${'</x>'.repeat(GPX_LIMITS.maxXmlDepth)}</gpx>`
    expectCode(() => parse(deep), 'xmlTooDeep')
  })
})

describe('GPX XML validation', () => {
  it('accepts GPX 1.0 and 1.1 namespaced roots with chunked input', () => {
    const gpx10 = '<gpx xmlns="http://www.topografix.com/GPX/1/0"><rte><rtept lat="1" lon="2"/></rte></gpx>'
    expect(parse(gpx10).activities[0]?.kind).toBe('route')
    expect(parse(trackXml(point())).usablePointCount).toBe(1)
  })

  it('preserves duplicate valid points and their raw timing/elevation metadata', () => {
    const duplicate = point('52.5', '13.4', '<ele>42.10</ele><time>2026-01-02T03:04:05Z</time>')
    const result = parse(trackXml(`${duplicate}${duplicate}`))
    expect(result.pointCount).toBe(2)
    expect(result.activities[0]?.segments[0]?.points).toEqual([
      { latitude: 52.5, longitude: 13.4, elevationText: '42.10', timeText: '2026-01-02T03:04:05Z' },
      { latitude: 52.5, longitude: 13.4, elevationText: '42.10', timeText: '2026-01-02T03:04:05Z' },
    ])
  })

  it('preserves Garmin heart-rate and cadence samples from track-point extensions', () => {
    const extensions = [
      ['v1', 'http://www.garmin.com/xmlschemas/TrackPointExtension/v1'],
      ['v2', 'http://www.garmin.com/xmlschemas/TrackPointExtension/v2'],
    ].map(([version, namespace]) =>
      `<trkpt lat="52.5" lon="13.4"><extensions><${version}:TrackPointExtension xmlns:${version}="${namespace}"><${version}:hr>147</${version}:hr><${version}:cad>82</${version}:cad></${version}:TrackPointExtension></extensions></trkpt>`,
    ).join('')
    const result = parse(trackXml(extensions))

    expect(result.activities[0]?.segments[0]?.points).toEqual([
      { latitude: 52.5, longitude: 13.4, heartRateText: '147', cadenceText: '82' },
      { latitude: 52.5, longitude: 13.4, heartRateText: '147', cadenceText: '82' },
    ])
  })

  it('does not treat similarly named non-Garmin extension fields as Garmin metrics', () => {
    const otherVendorPoint = point('52.5', '13.4',
      '<extensions><x:TrackPointExtension xmlns:x="https://example.test/extensions"><x:hr>147</x:hr><x:cad>82</x:cad></x:TrackPointExtension></extensions>',
    )
    const result = parse(trackXml(otherVendorPoint))
    expect(result.activities[0]?.segments[0]?.points).toEqual([{ latitude: 52.5, longitude: 13.4 }])
  })

  it('marks invalid coordinates as fragment breaks without bridging them', () => {
    const result = parse(trackXml(`${point()}${point('91', '13.4')}${point('51', '181')}${point('52', '13')}`))
    expect(result.pointCount).toBe(4)
    expect(result.usablePointCount).toBe(2)
    expect(result.invalidCoordinateCount).toBe(2)
    expect(result.activities[0]?.segments[0]?.points).toEqual([
      { latitude: 52.5, longitude: 13.4 }, null, null, { latitude: 52, longitude: 13 },
    ])
  })

  it('rejects malformed XML, unsafe declarations, unsupported roots, and missing coordinates', () => {
    expectCode(() => parse(`<gpx xmlns="${ns}"><trk>`), 'malformedXml')
    expectCode(() => parse(`<!DOCTYPE gpx [<!ENTITY x "unsafe">]>${trackXml(point())}`), 'unsafeXml')
    expectCode(() => parse(`<?xml-stylesheet href="https://example.test/style.xsl"?>${trackXml(point())}`), 'unsafeXml')
    expectCode(() => parse('<root/>'), 'unsupportedGpx')
    expectCode(() => parse(`<gpx xmlns="${ns}"><trk><trkseg>${point('NaN', 'NaN')}</trkseg></trk></gpx>`), 'noUsableCoordinates')
    expectCode(() => parse(trackXml(point('', '13.4'))), 'noUsableCoordinates')
    expectCode(() => parse('   \n  '), 'emptyFile')
  })

  it('returns localized error messages and invalid-coordinate warnings', () => {
    for (const code of errorCodes) {
      expect(getGpxValidationMessage(code, 'en')).toBeTruthy()
      expect(getGpxValidationMessage(code, 'de')).toBeTruthy()
    }
    expect(getGpxValidationMessage('fileTooLarge', 'en')).toContain('20 MiB')
    expect(getGpxValidationMessage('fileTooLarge', 'de')).toContain('20 MiB')
    expect(getInvalidCoordinateWarning(1, 'en')).toContain('1 invalid coordinate was discarded')
    expect(getInvalidCoordinateWarning(1, 'de')).toContain('1 ungültige Koordinate wurde verworfen')
    expect(getInvalidCoordinateWarning(2, 'de')).toContain('2 ungültige Koordinaten wurden verworfen')
  })
})
