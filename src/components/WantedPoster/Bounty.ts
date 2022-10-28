import { WantedImageInfo } from './types'
import CanvasObject from './CanvasObject'
import bellySignImageUrl from './images/belly.png'
import patternImageUrl from './images/text-pattern.png'
import { getTextActualHeight, loadImage } from './utils'

class Bounty extends CanvasObject {
  #text = ''
  #isNumber = true
  #space = 1
  #fontSize = 0
  #fillPattern: CanvasPattern | null = null
  #numberFormat: Intl.NumberFormat
  #bellySignImage: HTMLImageElement | null = null
  #bellySignMarginRight = 10
  #bellySignSize: { width: number; height: number } | null = null

  constructor(ctx: CanvasRenderingContext2D) {
    super(ctx)
    this.#numberFormat = new Intl.NumberFormat()
  }

  async init(wantedImageInfo: WantedImageInfo) {
    try {
      this.#bellySignImage = await loadImage(bellySignImageUrl)
      const patternImage = await loadImage(patternImageUrl)
      this.#fillPattern = this.ctx.createPattern(patternImage, 'repeat')
    } catch (error) {
      console.error(error)
      throw new Error('Failed to init bounty.')
    }

    this.setPosition(wantedImageInfo)
  }

  setPosition(wantedImageInfo: WantedImageInfo) {
    const { bountyPosition, bountyFontSize, bellySignSize } = wantedImageInfo
    this.x = bountyPosition.x
    this.y = bountyPosition.y
    this.width = bountyPosition.width
    this.height = bountyPosition.height
    this.#fontSize = bountyFontSize

    this.#bellySignSize = { ...bellySignSize }
  }

  set text(value: string) {
    const space = new Array(this.#space).join(' ') + ' '
    const price = Number.parseInt(value)
    if (Number.isNaN(price)) {
      this.#isNumber = false
      this.#text = Array.from(value).join(space)
      return
    }
    this.#isNumber = true
    const text = this.#numberFormat.format(price) + '-'
    this.#text = Array.from(text).join(space)
  }

  render(): void {
    if (!this.#bellySignImage || !this.#bellySignSize) {
      return
    }
    const { width, height } = this.#bellySignSize

    this.ctx.save()
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'top'
    this.ctx.fillStyle = this.#fillPattern ? this.#fillPattern : 'none'
    this.ctx.font = this.#isNumber
      ? `700 ${this.#fontSize * 0.75}px 'Averia Sans Libre'`
      : `900 ${this.#fontSize}px 'Scheherazade New', 'Noto Sans TC', serif`

    const centerX = this.x + this.width / 2
    const bellySignWidth = this.#isNumber
      ? width + this.#bellySignMarginRight
      : 0
    const actualHeight = getTextActualHeight(this.ctx, this.#text)
    let topOffset = (this.height - actualHeight) / 2

    // The position of number character of 'Averia Sans Libre' font is too low, therefore
    // here multiply 0.75 to move the position to top a little bit.
    if (this.#isNumber) {
      topOffset *= 0.75
    }

    const textX = centerX + bellySignWidth / 2
    const textY = this.y + topOffset
    const textMaxWidth = this.width - bellySignWidth
    this.ctx.fillText(this.#text, textX, textY, textMaxWidth)

    if (this.#isNumber) {
      const textWidth = Math.min(
        this.ctx.measureText(this.#text).width,
        textMaxWidth
      )
      const bellySignX = centerX - bellySignWidth / 2 - textWidth / 2
      this.ctx.drawImage(
        this.#bellySignImage,
        bellySignX,
        this.y,
        width,
        height
      )
    }

    this.ctx.restore()
  }
}

export default Bounty
