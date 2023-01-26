import bellySignImageUrl from './images/belly.png'
import Text from './Text'
import { WantedImageInfo } from './types'
import { getTextActualHeight, loadImage } from './utils'

class Bounty extends Text {
  #isNumber = true
  #numberFormat = new Intl.NumberFormat()
  #bellySignImage: HTMLImageElement | null = null
  #bellyMarginRight = 0
  #bellySignWidth = 0
  #bellySignHeight = 0

  async init() {
    try {
      this.#bellySignImage = await loadImage(bellySignImageUrl)
    } catch (error) {
      console.error(error)
      throw new Error('Failed to init bounty.')
    }
  }

  setPosition(wantedImageInfo: WantedImageInfo, scale: number) {
    const { bountyPosition, bountyFontSize } = wantedImageInfo
    this.x = bountyPosition.x
    this.y = bountyPosition.y
    this.width = bountyPosition.width
    this.height = bountyPosition.height
    this.fontSize = bountyFontSize
    this.#bellyMarginRight = wantedImageInfo.bellyMarginRight
    if (this.#bellySignImage) {
      this.#bellySignWidth = this.#bellySignImage.width * scale
      this.#bellySignHeight = this.#bellySignImage.height * scale
    }
  }

  formatText(text: string, spacing: number = 0): string {
    const price = Number.parseFloat(text)
    if (Number.isNaN(price)) {
      this.#isNumber = false
      return this.formatSpacing(text, spacing)
    }

    this.#isNumber = true
    const formattedPrice = this.#numberFormat.format(price) + '-'
    return this.formatSpacing(formattedPrice, spacing)
  }

  beforeRenderText() {
    if (!this.#bellySignImage) {
      return
    }

    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'top'

    this.ctx.font = this.#isNumber
      ? `600 ${this.fontSize * 0.75}px 'Vertiky'`
      : `900 ${this.fontSize}px 'Scheherazade New', serif`

    const centerX = this.x + this.width / 2
    const bellySignWidth = this.#isNumber
      ? this.#bellySignWidth + this.#bellyMarginRight
      : 0
    const actualHeight = getTextActualHeight(this.ctx, this.formattedText)
    let topOffset = (this.height - actualHeight) / 2

    // topOffset is not a fixed constant for adjusting the top position, it should change depending on the font we used.
    if (this.#isNumber) {
      topOffset *= 0.818
    }

    const x = centerX + bellySignWidth / 2
    const y = this.y + topOffset
    const maxWidth = this.width - bellySignWidth

    if (this.#isNumber) {
      const textWidth = Math.min(
        this.ctx.measureText(this.formattedText).width,
        maxWidth
      )
      const bellySignX = centerX - bellySignWidth / 2 - textWidth / 2
      this.ctx.drawImage(
        this.#bellySignImage,
        bellySignX,
        this.y,
        this.#bellySignWidth,
        this.#bellySignHeight
      )
    }

    return { x, y, maxWidth }
  }
}

export default Bounty
