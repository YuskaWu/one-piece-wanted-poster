import { Position } from './types'
import CanvasObject from './CanvasObject'
import patternImageUrl from './images/text-pattern.png'
import { getTextActualHeight, loadImage } from './utils'

class Name extends CanvasObject {
  #text = ''
  #space = 1
  #fontSize = 0
  #fillPattern: CanvasPattern | null = null
  // for 'Gelasio' font to fullfill the height of name area
  #fontSizeScale = 1.31

  async init(position: Position) {
    try {
      const patternImage = await loadImage(patternImageUrl)
      this.#fillPattern = this.ctx.createPattern(patternImage, 'repeat')
    } catch (error) {
      console.error(error)
      throw new Error('Failed to init Name.')
    }

    this.setPosition(position)
  }

  setPosition(position: Position) {
    this.x = position.x
    this.y = position.y
    this.width = position.width
    this.height = position.height
    this.#fontSize = this.height * this.#fontSizeScale
  }

  set text(value: string) {
    const space = new Array(this.#space).join(' ') + ' '
    this.#text = Array.from(value).join(space)
  }

  render(): void {
    this.ctx.save()
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'top'
    this.ctx.fillStyle = this.#fillPattern ? this.#fillPattern : 'none'
    this.ctx.font = `900 ${
      this.#fontSize
    }px 'Gelasio', 'Noto Sans TC', sans-serif`

    // The actual height of text may exceed the boundary of name area when text includes
    // characters which is not english alphabet, so here we need to calculate the actual height
    // and scale it before rendering
    const actualHeight = getTextActualHeight(this.ctx, this.#text)
    const scale = this.height / actualHeight
    const offsetY = (actualHeight - this.height) / 2
    this.ctx.font = `900 ${Math.floor(
      this.#fontSize * scale
    )}px 'Gelasio', 'Noto Sans TC', sans-serif`

    this.ctx.fillText(
      this.#text,
      this.x + this.width / 2,
      this.y + offsetY,
      this.width
    )
    this.ctx.restore()
  }
}

export default Name
