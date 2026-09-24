import { getGpxValidationMessage } from '../utils/gpxValidationMessages'
import { parseGpxFile } from '../utils/gpxFileParser'
import { GpxValidationError, type GpxMessageLocale, type ValidatedGpx } from '../utils/gpxValidationTypes'

type ParseRequest = {
  type: 'parse'
  requestId: string
  file: File
  locale: GpxMessageLocale
}

type CancelRequest = {
  type: 'cancel'
  requestId: string
}

type WorkerRequest = ParseRequest | CancelRequest

type WorkerResponse = {
  requestId: string
  result?: ValidatedGpx
  error?: { code: string; message: string }
}

type WorkerScope = {
  addEventListener(type: 'message', listener: (event: MessageEvent<WorkerRequest>) => void): void
  postMessage(message: WorkerResponse): void
}

const workerScope = self as unknown as WorkerScope
let activeRequest: { requestId: string; controller: AbortController } | undefined

workerScope.addEventListener('message', ({ data }) => {
  if (data.type === 'cancel') {
    if (activeRequest?.requestId === data.requestId) activeRequest.controller.abort()
    return
  }

  activeRequest?.controller.abort()
  const controller = new AbortController()
  activeRequest = { requestId: data.requestId, controller }

  void parseGpxFile(data.file, controller.signal).then(
    result => workerScope.postMessage({ requestId: data.requestId, result }),
    error => {
      // Preserve specific validation messages; unclassified failures use the generic malformed-input message.
      const code = error instanceof GpxValidationError ? error.code : 'malformedXml'
      workerScope.postMessage({
        requestId: data.requestId,
        error: { code, message: getGpxValidationMessage(code, data.locale) },
      })
    },
  ).finally(() => {
    if (activeRequest?.requestId === data.requestId) activeRequest = undefined
  })
})
