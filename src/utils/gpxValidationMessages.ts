import type { GpxLocale, GpxValidationErrorCode } from './gpxValidationTypes'

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
