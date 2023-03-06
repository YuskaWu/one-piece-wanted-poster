interface LaunchQueue {
  setConsumer(consumer: LaunchConsumer): void
}

// spec:
// https://wicg.github.io/web-app-launch/#script-interfaces-to-app-launches
interface LaunchParams {
  readonly targetURL?: string
  readonly files?: FileSystemHandle[]
}

interface LaunchConsumer {
  (params: LaunchParams): void
}

declare global {
  interface Window {
    LaunchParams?: LaunchParams
    readonly launchQueue?: LaunchQueue
  }
}

const isSupported =
  window.launchQueue && window.LaunchParams && window.LaunchParams.files

function setConsumer(
  callback: (fileHandles: NonNullable<LaunchParams['files']>) => void
) {
  if (!isSupported) {
    console.warn(
      '[Launch Handler API] browser does not support Launch Handler API, ignoring consumption.'
    )
    return
  }
  window.launchQueue?.setConsumer((launchParams) => {
    // Nothing to do when the queue is empty.
    if (!launchParams.files?.length) {
      return
    }

    callback(launchParams.files)
  })
}

function isFileHandle(
  fileHandle: FileSystemHandle
): fileHandle is FileSystemFileHandle {
  return fileHandle.kind === 'file'
}

export default { setConsumer, isSupported, isFileHandle }
