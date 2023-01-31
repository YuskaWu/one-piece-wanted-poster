interface LaunchQueue {
  setConsumer(comsumer: LaunchConsumer): void
}

interface LaunchParams extends Function {
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
  'launchQueue' in window &&
  window.LaunchParams &&
  'files' in window.LaunchParams.prototype

function consume(
  callback: (fileHandles: NonNullable<LaunchParams['files']>) => void
) {
  if (!isSupported) {
    console.warn(
      '[FileHandlingAPI] browser does not support File Handling API, ignoring consumption.'
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

function isFileSystemFileHandle(
  fileHandle: FileSystemHandle | FileSystemDirectoryHandle
): fileHandle is FileSystemFileHandle {
  return fileHandle.kind === 'file'
}

export default { consume, isSupported, isFileSystemFileHandle }
