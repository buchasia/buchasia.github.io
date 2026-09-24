import { GPX_LIMITS, GpxValidationError, type ValidatedGpx } from './gpxValidationTypes'
import { GpxStreamValidator } from './gpxStreamValidator'

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
  // Reject invalid UTF-8 instead of silently replacing bytes and parsing altered input.
  const decoder = new TextDecoder('utf-8', { fatal: true })

  try {
    for (let offset = 0; offset < file.size; offset += GPX_LIMITS.readChunkBytes) {
      if (signal?.aborted) throw new GpxValidationError('cancelled')
      const end = Math.min(offset + GPX_LIMITS.readChunkBytes, file.size)
      const bytes = await file.slice(offset, end).arrayBuffer()
      // Keep an incomplete multibyte character between chunks; flush/validate on the final chunk.
      validator.write(decoder.decode(bytes, { stream: end < file.size }))
    }
    // Flush decoder state and reject an incomplete UTF-8 sequence at end of file.
    validator.write(decoder.decode())
    if (signal?.aborted) throw new GpxValidationError('cancelled')
    return validator.finish()
  } catch (error) {
    if (error instanceof GpxValidationError) throw error
    if (signal?.aborted) throw new GpxValidationError('cancelled')
    // TextDecoder failures (invalid UTF-8) are presented with malformed XML, like SAX syntax errors.
    throw new GpxValidationError('malformedXml')
  }
}
