abstract class CanvasObject {
  x: number = 0
  y: number = 0
  width: number = 0
  height: number = 0
  protected ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  scale(scale: number) {
    this.x = this.x * scale
    this.y = this.y * scale
    this.width = this.width * scale
    this.height = this.height * scale
  }

  abstract render(): void
}

export default CanvasObject
