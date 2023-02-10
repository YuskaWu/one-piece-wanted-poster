import GraphicObject from './GraphicObject'

abstract class Text extends GraphicObject {
  #text = ''
  #spacing = 0
  formattedText = ''
  align: CanvasTextAlign = 'center'
  baseline: CanvasTextBaseline = 'top'
  fontSize = 0

  set text(value: string) {
    this.#text = value
    this.formattedText = this.formatText(value, this.#spacing)
  }

  get text() {
    return this.#text
  }

  set spacing(value: number) {
    this.#spacing = value
    this.formattedText = this.formatText(this.#text, value)
  }

  get spacing() {
    return this.#spacing
  }

  formatSpacing(text: string, spacing: number) {
    let space = ''
    for (let i = 0; i < spacing; i++) {
      space += ' '
    }
    return Array.from(text).join(space)
  }

  formatText(text: string, spacing: number = 0): string {
    return this.formatSpacing(text, spacing)
  }

  // calculate actual height of text
  // see https://stackoverflow.com/a/46950087
  getTextActualHeight(text: string) {
    const { actualBoundingBoxAscent, actualBoundingBoxDescent } =
      this.ctx.measureText(text)
    return actualBoundingBoxAscent + actualBoundingBoxDescent
  }

  beforeRenderText(): { x?: number; y?: number; maxWidth?: number } | void {}

  #renderText(
    x: number = this.x,
    y: number = this.y,
    maxWidth = this.width
  ): void {
    // Use 'soft-light' composition to enhance the luma of poster texture
    this.ctx.fillStyle = 'rgba(0,0,0,0.78)'
    this.ctx.globalCompositeOperation = 'soft-light'
    this.ctx.fillText(this.formattedText, x, y, maxWidth)
    this.ctx.fillText(this.formattedText, x, y, maxWidth)
    this.ctx.fillText(this.formattedText, x, y, maxWidth)

    // Use 'color' composition to preserve the luma of the text we have filled above
    // and adopt new layer to adjust the hue and chroma.
    this.ctx.fillStyle = 'rgba(84,60,48,1)'
    this.ctx.globalCompositeOperation = 'color'
    this.ctx.fillText(this.formattedText, x, y, maxWidth)
  }

  render() {
    this.ctx.save()

    this.ctx.textAlign = this.align
    this.ctx.textBaseline = this.baseline

    const { x, y, maxWidth } = this.beforeRenderText() ?? {}

    this.#renderText(x, y, maxWidth)

    this.ctx.restore()
  }
}

export default Text
