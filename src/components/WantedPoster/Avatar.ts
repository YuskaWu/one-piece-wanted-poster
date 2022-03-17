import CanvasObject from './CanvasObject'
import { getScale, loadImage } from './utils'
import { Position, WantedImageInfo } from './types'
import backgroundImageUrl from './images/paper.png'

type EventName = 'imageloaded'

type RenderOffset = {
  left: number
  right: number
  top: number
  bottom: number
}

const DEFAULT_POSITION = { x: 0, y: 0, width: 0, height: 0 }

class Avatar extends CanvasObject {
  filter = 'grayscale(35%) sepia(40%) saturate(80%) contrast(105%)'
  #listeners = new Map<EventName, Array<() => void>>()
  #image: HTMLImageElement | null = null
  #fillPattern: CanvasPattern | null = null
  #transparentPosition: Position = { ...DEFAULT_POSITION }
  #renderPosition: Position = { ...DEFAULT_POSITION }
  #renderOffset: RenderOffset = { left: 0, right: 0, top: 0, bottom: 0 }

  async init(wantedImageInfo: WantedImageInfo) {
    try {
      const bgImage = await loadImage(backgroundImageUrl)
      this.#fillPattern = this.ctx.createPattern(bgImage, 'repeat')
    } catch (error) {
      console.error(error)
      throw new Error('Failed to create fill pattern.')
    }

    this.#resetPosition(wantedImageInfo)
  }

  async loadImage(url: string | null) {
    if (!url) {
      return
    }

    try {
      this.#image = await loadImage(url)
      this.updateRenderPosition()
      this.#listeners.get('imageloaded')?.forEach((fn) => fn())
    } catch (error) {
      console.error(error)
      throw new Error('Failed to load avatar image.')
    }
  }

  #resetPosition(wantedImageInfo: WantedImageInfo) {
    const { avatarPosition, boundaryOffset } = wantedImageInfo
    this.x = avatarPosition.x
    this.y = avatarPosition.y
    this.width = avatarPosition.width
    this.height = avatarPosition.height

    this.#renderOffset = { ...boundaryOffset }

    this.#transparentPosition = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    }

    this.updateRenderPosition()
  }

  scale(scale: number) {
    super.scale(scale)
    this.updateRenderPosition()
  }

  setAvatarPosition(position: Position) {
    this.#transparentPosition = position
  }

  updateRenderPosition() {
    if (!this.#image) {
      return
    }

    const scale = getScale(
      this.width,
      this.height,
      this.#image.width,
      this.#image.height
    )

    // The size of scaled image may be smaller than avatar area, so here we
    // calculate render position to put the scaled image to the center of avatar area.
    const width = this.#image.width * scale
    const height = this.#image.height * scale

    const x = this.x + (this.width - width) / 2
    const y = this.y + (this.height - height) / 2

    this.#renderPosition = { x, y, width, height }
  }

  on(eventName: EventName, fn: () => void) {
    if (!this.#listeners.has(eventName)) {
      this.#listeners.set(eventName, [])
    }

    this.#listeners.get(eventName)?.push(fn)
  }

  off(eventName: EventName, fn: () => void) {
    const listeners = this.#listeners.get(eventName)
    if (!listeners) {
      return
    }
    const index = listeners.findIndex((f) => f === fn)
    listeners.splice(index, 1)
  }

  render(): void {
    this.ctx.save()
    // render background on the transparent area of avatar
    this.ctx.fillStyle = this.#fillPattern ? this.#fillPattern : 'none'
    this.ctx.fillRect(
      this.#transparentPosition.x,
      this.#transparentPosition.y,
      this.#transparentPosition.width,
      this.#transparentPosition.height
    )

    if (!this.#image) {
      this.ctx.restore()
      return
    }

    const { x, y, width, height } = this.#renderPosition
    this.ctx.filter = this.filter
    this.ctx.drawImage(this.#image, x, y, width, height)

    // following logic is to clear rectangles which is outside the boundary of wanted image
    const { left, right, top, bottom } = this.#renderOffset

    // clear left edge
    x <= left && this.ctx.clearRect(0, y, left, height)
    // clear top edge
    y <= top && this.ctx.clearRect(x, 0, width, top)
    // claer right edge
    if (x + width > this.ctx.canvas.width - right) {
      this.ctx.clearRect(this.ctx.canvas.width - right, y, right, height)
    }
    // clear bottom edge
    if (y + height > this.ctx.canvas.height - bottom) {
      this.ctx.clearRect(x, this.ctx.canvas.height - bottom, width, bottom)
    }

    this.ctx.canvas.width
    this.ctx.restore()
  }
}

export default Avatar
