abstract class CanvasObject {
  x: number = 0
  y: number = 0
  width: number = 0
  height: number = 0
  protected ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  abstract render(): void
}

export default CanvasObject
