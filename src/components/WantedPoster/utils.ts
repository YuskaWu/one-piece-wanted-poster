export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.setAttribute('crossorigin', 'anonymous')
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export function getScale(
  destinationWidth: number,
  destinationHeight: number,
  sourceWidth: number,
  sourceHeight: number
) {
  const widthMultiple = destinationWidth / sourceWidth
  const hightMultiple = destinationHeight / sourceHeight
  return Math.min(hightMultiple, widthMultiple)
}

export function downloadFile(uri: string, fileName: string) {
  let anchor = document.createElement('a')
  anchor.setAttribute('href', uri)
  anchor.setAttribute('download', fileName)
  anchor.style.display = 'none'

  document.body.appendChild(anchor)

  anchor.click()
  anchor.remove()
}
