import { Position, WantedImageInfo } from './types'
import { getScale, loadImage } from './utils'

class WantedImage {
  #ctx: CanvasRenderingContext2D
  #canvas: HTMLCanvasElement
  #scale = 1
  #scaledShadowSize = 0
  #shadowSize = 0
  #scaledWidth = 0
  #scaledHeight = 0
  #image: HTMLImageElement | null = null
  #wantedImageInfo: WantedImageInfo | null = null

  constructor(ctx: CanvasRenderingContext2D) {
    this.#ctx = ctx
    this.#canvas = ctx.canvas
  }

  get scale() {
    return this.#scale
  }

  async loadImage(info: WantedImageInfo) {
    try {
      const image = await loadImage(info.url)
      this.#image = image
      this.#scaledWidth = image.width
      this.#scaledHeight = image.height
      this.#wantedImageInfo = info
    } catch (error) {
      console.error(error)
      throw new Error('Failed to load wanted image.')
    }
  }

  setSize({
    width,
    height,
    shadowSize
  }: {
    width?: number
    height?: number
    shadowSize?: number
  }) {
    if (!this.#image) {
      throw new Error('Failed to set size: wanted image is null')
    }

    this.#scaledWidth = width ?? this.#scaledWidth
    this.#scaledHeight = height ?? this.#scaledHeight
    this.#shadowSize = shadowSize ?? this.#shadowSize

    const actualWidth = this.#image.width + this.#shadowSize * 2
    const actualHeight = this.#image.height + this.#shadowSize * 2

    const scale = getScale(
      this.#scaledWidth,
      this.#scaledHeight,
      actualWidth,
      actualHeight
    )

    this.#scale = scale
    this.#scaledShadowSize = this.#shadowSize * scale
    this.#canvas.width = actualWidth * scale
    this.#canvas.height = actualHeight * scale

    const wantedImageInfo = this.#calculateImageInfo(
      scale,
      this.#scaledShadowSize
    )

    return { wantedImageInfo, scale, scaledShadowSize: this.#scaledShadowSize }
  }

  #calculateImageInfo(scale: number, padding: number): WantedImageInfo {
    if (!this.#wantedImageInfo) {
      throw new Error(
        'Failed to calculate wanted image info: WantedImageInfo object is null'
      )
    }

    const {
      url,
      width,
      height,
      avatarPosition,
      namePosition,
      bountyPosition,
      bountyFontSize,
      boundaryOffset,
      bellySignSize
    } = this.#wantedImageInfo

    const calculatePosition = (p: Position) => {
      const { x, y, width, height } = p
      return {
        x: x * scale + padding,
        y: y * scale + padding,
        width: width * scale,
        height: height * scale
      }
    }

    return {
      url,
      width,
      height,
      avatarPosition: calculatePosition(avatarPosition),
      namePosition: calculatePosition(namePosition),
      bountyPosition: calculatePosition(bountyPosition),
      bountyFontSize: bountyFontSize * scale,
      boundaryOffset: {
        left: boundaryOffset.left * scale + padding,
        right: boundaryOffset.right * scale + padding,
        top: boundaryOffset.top * scale + padding,
        bottom: boundaryOffset.bottom * scale + padding
      },
      bellySignSize: {
        width: bellySignSize.width * scale,
        height: bellySignSize.height * scale
      }
    }
  }

  render() {
    if (!this.#image) {
      return
    }
    this.#ctx.save()
    this.#ctx.shadowColor = 'rgba(0, 0, 0, 1)'
    this.#ctx.shadowBlur = this.#scaledShadowSize
    this.#ctx.drawImage(
      this.#image,
      this.#scaledShadowSize,
      this.#scaledShadowSize,
      this.#canvas.width - this.#scaledShadowSize * 2,
      this.#canvas.height - this.#scaledShadowSize * 2
    )
    this.#ctx.restore()
  }
}

export default WantedImage
