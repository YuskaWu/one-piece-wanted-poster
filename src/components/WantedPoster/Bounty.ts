import Text from './Text'
import { BountyInfo } from './types'
import { loadImage } from './utils'

class Bounty extends Text {
  #isNumber = true
  #numberFormat = new Intl.NumberFormat()
  #bellySignImage: HTMLImageElement | null = null
  #bellyImageScale = 1
  #bellyMarginRight = 0

  async loadBellyImage(url: string) {
    try {
      this.#bellySignImage = await loadImage(url)
    } catch (error) {
      console.error(error)
      throw new Error('Failed to init bounty.')
    }
  }

  setBountyInfo(bountyInfo: BountyInfo, bellyImageScale: number) {
    const { x, y, width, height, bellyMarginRight, fontSize } = bountyInfo
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.fontSize = fontSize
    this.#bellyMarginRight = bellyMarginRight
    this.#bellyImageScale = bellyImageScale
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

    const scaledBellySignWidth =
      this.#bellySignImage.width * this.#bellyImageScale
    const scaledBellySignHeight =
      this.#bellySignImage.height * this.#bellyImageScale

    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'top'

    this.ctx.font = this.#isNumber
      ? `600 ${this.fontSize * 0.75}px 'Vertiky'`
      : `900 ${this.fontSize}px 'Scheherazade New', serif`

    const centerX = this.x + this.width / 2
    const bellySignAreaWidth = this.#isNumber
      ? scaledBellySignWidth + this.#bellyMarginRight
      : 0
    const actualHeight = this.getTextActualHeight(this.formattedText)
    let topOffset = (this.height - actualHeight) / 2

    // topOffset is not a fixed constant for adjusting the top position, it should change depending on the font we used.
    if (this.#isNumber) {
      topOffset *= 0.818
    }

    const x = centerX + bellySignAreaWidth / 2
    const y = this.y + topOffset
    const maxWidth = this.width - bellySignAreaWidth

    if (this.#isNumber) {
      const textWidth = Math.min(
        this.ctx.measureText(this.formattedText).width,
        maxWidth
      )
      const bellySignX = centerX - bellySignAreaWidth / 2 - textWidth / 2
      this.ctx.globalCompositeOperation = 'darken'
      this.ctx.drawImage(
        this.#bellySignImage,
        bellySignX,
        this.y,
        scaledBellySignWidth,
        scaledBellySignHeight
      )
    }

    return { x, y, maxWidth }
  }
}

export default Bounty
