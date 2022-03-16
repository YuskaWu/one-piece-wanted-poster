export async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
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

export function isInside(
  x: number,
  y: number,
  areaX: number,
  areaY: number,
  areaWidth: number,
  areaHeight: number,
  borderWidth = 0
) {
  const offset = borderWidth / 2
  const outerBeginX = areaX - offset
  const outerBeginY = areaY - offset
  const outerEndX = areaX + areaWidth + offset
  const outerEndY = areaY + areaHeight + offset

  const isInsideX = x >= outerBeginX && x <= outerEndX
  const isInsideY = y >= outerBeginY && y <= outerEndY

  return isInsideX && isInsideY
}

export function getBorderHoverInfo(
  x: number,
  y: number,
  areaX: number,
  areaY: number,
  areaWidth: number,
  areaHeight: number,
  borderWidth = 0
) {
  const offset = borderWidth / 2
  const outerBeginX = areaX - offset
  const outerBeginY = areaY - offset
  const outerEndX = areaX + areaWidth + offset
  const outerEndY = areaY + areaHeight + offset

  const innerBeginX = areaX + offset
  const innerBeginY = areaY + offset
  const innerEndX = areaX + areaWidth - offset
  const innerEndY = areaY + areaHeight - offset

  return {
    left: x >= outerBeginX && x <= innerBeginX ? true : false,
    right: x >= innerEndX && x <= outerEndX ? true : false,
    top: y >= outerBeginY && y <= innerBeginY ? true : false,
    bottom: y >= innerEndY && y <= outerEndY ? true : false
  }
}

// calculate actual height of text
// see https://stackoverflow.com/a/46950087
export function getTextActualHeight(
  ctx: CanvasRenderingContext2D,
  text: string
) {
  const { actualBoundingBoxAscent, actualBoundingBoxDescent } =
    ctx.measureText(text)
  return actualBoundingBoxAscent + actualBoundingBoxDescent
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
