import Avatar from './Avatar'
import CanvasObject from './CanvasObject'
import { getBorderHoverInfo, isInside } from './utils'

class AvatarResizer extends CanvasObject {
  #canvasRect: DOMRect
  #avatar: Avatar
  #isHover = false
  #isMousedown = false
  #isResizing = false
  #borderWidth = 4
  #resizeBorder: 'left' | 'right' | 'top' | 'bottom' | null = null

  #dashOffset = 0

  #preX = 0
  #preY = 0

  constructor(ctx: CanvasRenderingContext2D, avatar: Avatar) {
    super(ctx)
    this.#avatar = avatar
    this.#canvasRect = ctx.canvas.getBoundingClientRect()

    this.ctx

    avatar.on('imageloaded', () => this.reset())
    ctx.canvas.addEventListener('mousedown', this.#onMousedown.bind(this))
    ctx.canvas.addEventListener('mouseup', this.#onMouseup.bind(this))
    ctx.canvas.addEventListener('mousemove', this.#onMouseover.bind(this))
  }

  reset() {
    this.#canvasRect = this.ctx.canvas.getBoundingClientRect()
    this.x = this.#avatar.x
    this.y = this.#avatar.y
    this.width = this.#avatar.width
    this.height = this.#avatar.height
    this.#isHover = false
    this.#isMousedown = false
    this.#isResizing = false
  }

  #onMousedown() {
    this.#isMousedown = true
  }

  #onMouseup() {
    this.#isMousedown = false
    this.#isResizing = false
  }

  #onMouseover(e: MouseEvent) {
    const canvasX = e.clientX - this.#canvasRect.left
    const canvasY = e.clientY - this.#canvasRect.top

    if (this.#isMousedown) {
      const diffX = e.clientX - this.#preX
      const diffY = e.clientY - this.#preY
      this.#resize(diffX, diffY)
    }

    if (!this.#isResizing) {
      this.#setCursor(canvasX, canvasY)
    }

    if (
      isInside(
        canvasX,
        canvasY,
        this.x,
        this.y,
        this.width,
        this.height,
        this.#borderWidth
      )
    ) {
      this.#isHover = true
    } else {
      this.#isHover = false
    }

    this.#preX = e.clientX
    this.#preY = e.clientY
  }

  #setCursor(canvasX: number, canvasY: number) {
    const borderHoverInfo = getBorderHoverInfo(
      canvasX,
      canvasY,
      this.x,
      this.y,
      this.width,
      this.height,
      this.#borderWidth
    )

    if (borderHoverInfo.left || borderHoverInfo.right) {
      this.ctx.canvas.style.cursor = 'ew-resize'
      this.#resizeBorder = borderHoverInfo.left ? 'left' : 'right'
    } else if (borderHoverInfo.top || borderHoverInfo.bottom) {
      this.ctx.canvas.style.cursor = 'ns-resize'
      this.#resizeBorder = borderHoverInfo.top ? 'top' : 'bottom'
    } else if (this.#isHover) {
      this.ctx.canvas.style.cursor = 'move'
    } else {
      this.ctx.canvas.style.cursor = 'default'
    }
  }

  #resize(diffX: number, diffY: number) {
    switch (this.ctx.canvas.style.cursor) {
      case 'move':
        this.x += diffX
        this.y += diffY

        this.#avatar.x += diffX
        this.#avatar.y += diffY
        this.#avatar.updateRenderPosition()
        break

      case 'ew-resize': {
        this.#isResizing = true
        if (this.#resizeBorder === 'right') {
          const newWidth = Math.max(this.width + diffX, 1)
          this.width = newWidth
          this.#avatar.width = newWidth
        } else {
          const newX = this.x + diffX
          if (newX >= this.x + this.width) {
            break
          }
          const newWidth = this.width - diffX
          this.x = newX
          this.#avatar.x = newX
          this.width = newWidth
          this.#avatar.width = newWidth
        }
        this.#avatar.updateRenderPosition()
        break
      }

      case 'ns-resize': {
        this.#isResizing = true
        if (this.#resizeBorder === 'bottom') {
          const newHeight = Math.max(this.height + diffY, 1)
          this.height = newHeight
          this.#avatar.height = newHeight
        } else {
          const newY = this.y + diffY
          if (newY >= this.y + this.height) {
            break
          }
          const newHeight = this.height - diffY
          this.y = newY
          this.#avatar.y = newY
          this.height = newHeight
          this.#avatar.height = newHeight
        }
        this.#avatar.updateRenderPosition()
      }
    }
  }

  render() {
    if (!this.#isHover && !this.#isResizing) {
      return
    }
    this.ctx.save()
    this.#dashOffset++
    if (this.#dashOffset > 16) {
      this.#dashOffset = 0
    }
    this.ctx.lineDashOffset = -this.#dashOffset
    this.ctx.fillStyle = 'rgba(255,255,255,0.5)'
    this.ctx.strokeStyle = 'red'
    this.ctx.lineWidth = this.#borderWidth
    this.ctx.setLineDash([10, 5])

    this.ctx.fillRect(this.x, this.y, this.width, this.height)
    this.ctx.strokeRect(this.x, this.y, this.width, this.height)

    this.ctx.restore()
  }
}

export default AvatarResizer
