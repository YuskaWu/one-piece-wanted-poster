import type { PosterCanvasElement, PosterRenderingContext2D } from './types'
import { Position, WantedImageInfo } from './types'
import { getScale, loadImage } from './utils'

class WantedImage {
  #ctx: PosterRenderingContext2D
  #canvas: PosterCanvasElement
  #scaledShadowSize = 0

  #imageScale = 1

  #image: HTMLImageElement | null = null
  #wantedImageInfo: WantedImageInfo

  constructor(ctx: PosterRenderingContext2D, info: WantedImageInfo) {
    this.#ctx = ctx
    this.#canvas = ctx.canvas
    this.#wantedImageInfo = info
  }

  async loadImage() {
    let image
    try {
      image = await loadImage(this.#wantedImageInfo.imageUrl)
      this.#image = image
    } catch (error) {
      console.error(error)
      throw new Error('Failed to load wanted image.')
    }

    return image
  }

  get imageScale() {
    return this.#imageScale
  }

  setSize({
    width: containerWidth,
    height: containerHeight,
    shadowSize,
    quality
  }: {
    width: number
    height: number
    shadowSize: number
    // "quality" is the resolution of canvas, it will affect the rendering performance.
    // For better user experience, use 'half' during editing, and use 'original' for exporting.
    quality: 'high' | 'half' | 'original'
  }) {
    if (!this.#image) {
      throw new Error('Failed to set size: wanted image is null')
    }

    const posterImageWidth = this.#image.width + shadowSize * 2
    const posterImageHeight = this.#image.height + shadowSize * 2

    const imageScale = getScale(
      containerWidth,
      containerHeight,
      posterImageWidth,
      posterImageHeight
    )

    this.#imageScale = imageScale

    const canvasDomWidth = posterImageWidth * imageScale
    const canvasDomHeight = posterImageHeight * imageScale
    this.#scaledShadowSize = shadowSize * imageScale

    this.#canvas.style.width = canvasDomWidth + 'px'
    this.#canvas.style.height = canvasDomHeight + 'px'
    this.#canvas.domWidth = canvasDomWidth
    this.#canvas.domHeight = canvasDomHeight

    switch (quality) {
      case 'original':
        this.#canvas.width = posterImageWidth
        this.#canvas.height = posterImageHeight
        this.#ctx.scale(1 / imageScale, 1 / imageScale)
        break

      case 'high': {
        // Set actual size in memory (scaled to account for extra pixel density).
        let scale = window.devicePixelRatio
        this.#canvas.width = canvasDomWidth * scale
        this.#canvas.height = canvasDomHeight * scale
        // Normalize coordinate system to use CSS pixels.
        this.#ctx.scale(scale, scale)
        break
      }

      case 'half': {
        let scale = this.#image.height / canvasDomHeight / 2
        this.#canvas.width = canvasDomWidth * scale
        this.#canvas.height = canvasDomHeight * scale
        this.#ctx.scale(scale, scale)
        break
      }
    }

    const wantedImageInfo = this.#calculateImageInfo(imageScale, shadowSize)

    return wantedImageInfo
  }

  #calculateImageInfo(scale: number, padding: number): WantedImageInfo {
    if (!this.#wantedImageInfo) {
      throw new Error(
        'Failed to calculate wanted image info: WantedImageInfo object is null'
      )
    }

    padding *= scale

    const {
      imageUrl,
      bellyImageUrl,
      photoPosition,
      namePosition,
      bountyInfo,
      boundaryOffset
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

    const newBountyInfo = {
      ...calculatePosition(bountyInfo),
      bellyMarginRight: bountyInfo.bellyMarginRight * scale,
      fontSize: bountyInfo.fontSize * scale
    }

    return {
      imageUrl,
      bellyImageUrl,
      photoPosition: calculatePosition(photoPosition),
      namePosition: calculatePosition(namePosition),
      bountyInfo: newBountyInfo,
      boundaryOffset: {
        left: boundaryOffset.left * scale + padding,
        right: boundaryOffset.right * scale + padding,
        top: boundaryOffset.top * scale + padding,
        bottom: boundaryOffset.bottom * scale + padding
      }
    }
  }

  render() {
    if (!this.#image) {
      return
    }
    this.#ctx.save()
    this.#ctx.shadowColor = 'rgba(0, 0, 0, 1)'
    // shadowBlur value doesn't correspond to a number of pixels, and is
    // not affected by the current transformation matrix.
    // To make the size correct, we need to multiply the scale between canvas size and canvas DOM size
    this.#ctx.shadowBlur =
      this.#scaledShadowSize * (this.#canvas.width / this.#canvas.domWidth)

    this.#ctx.drawImage(
      this.#image,
      this.#scaledShadowSize,
      this.#scaledShadowSize,
      this.#canvas.domWidth - this.#scaledShadowSize * 2,
      this.#canvas.domHeight - this.#scaledShadowSize * 2
    )
    this.#ctx.restore()
  }
}

export default WantedImage
