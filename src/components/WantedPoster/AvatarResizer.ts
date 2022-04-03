import Avatar from './Avatar'
import CanvasObject from './CanvasObject'
import { getBorderHoverInfo, isInside } from './utils'

class AvatarResizer extends CanvasObject {
  #avatar: Avatar
  #isHover = false
  #isMousedown = false
  #isResizing = false
  #borderWidth = 4
  #resizeBorder: 'left' | 'right' | 'top' | 'bottom' | null = null

  #trackingTouches: Map<number, Touch> = new Map()

  #dashOffset = 0

  #clientX = 0
  #clientY = 0

  constructor(ctx: CanvasRenderingContext2D, avatar: Avatar) {
    super(ctx)
    this.#avatar = avatar

    avatar.on('imageloaded', () => this.reset())
    ctx.canvas.addEventListener('mousedown', this.#onMousedown.bind(this))
    ctx.canvas.addEventListener('mouseup', this.#onMouseup.bind(this))
    ctx.canvas.addEventListener('mousemove', this.#onMouseover.bind(this))
    ctx.canvas.addEventListener('mouseout', this.#onMouseout.bind(this))
    ctx.canvas.addEventListener('wheel', this.#onWheel.bind(this))

    ctx.canvas.addEventListener('touchstart', this.#onTouchstart.bind(this))
    ctx.canvas.addEventListener('touchend', this.#onTouchend.bind(this))
    ctx.canvas.addEventListener('touchcancel', this.#onTouchcancel.bind(this))
    ctx.canvas.addEventListener('touchmove', this.#onTouchmove.bind(this))
  }

  reset() {
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
    const { left, top } = this.ctx.canvas.getBoundingClientRect()
    const canvasX = e.clientX - left
    const canvasY = e.clientY - top

    if (this.#isMousedown) {
      const diffX = e.clientX - this.#clientX
      const diffY = e.clientY - this.#clientY
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

    this.#clientX = e.clientX
    this.#clientY = e.clientY
  }

  #onMouseout() {
    this.#isMousedown = false
    this.#isResizing = false
    this.#isHover = false
  }

  #onWheel(e: WheelEvent) {
    e.preventDefault()
    const scale = e.deltaY > 0 ? 0.9 : 1.1
    this.#zoom(scale)
  }

  // a new touch on the surface has occurred
  #onTouchstart(e: TouchEvent) {
    // keep the browser from continuing to process the touch event,
    // and also prevents a mouse event from also being delivered
    e.preventDefault()

    const touches = e.changedTouches
    // add tracking touches
    for (let i = 0; i < touches.length; i++) {
      this.#trackingTouches.set(touches[i].identifier, touches[i])
    }

    const { left, top } = this.ctx.canvas.getBoundingClientRect()
    let isHover = false
    for (let touch of this.#trackingTouches.values()) {
      const canvasX = touch.clientX - left
      const canvasY = touch.clientY - top

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
        isHover = true
        break
      }
    }

    this.#isHover = isHover
  }

  // user lifts a finger off the surface
  #onTouchend(e: TouchEvent) {
    e.preventDefault()
    this.#removeTrackingTouches(e.changedTouches)
  }

  // user's finger wanders into browser UI, or the touch otherwise needs to be canceled
  #onTouchcancel(e: TouchEvent) {
    e.preventDefault()
    this.#removeTrackingTouches(e.changedTouches)
  }

  #onTouchmove(e: TouchEvent) {
    e.preventDefault()
    const touches = e.changedTouches

    if (touches.length === 1 && this.#isHover) {
      const touch = touches[0]
      const { clientX, clientY } = touch

      const preTouch = this.#trackingTouches.get(touch.identifier)
      // move resizer
      if (preTouch) {
        const diffX = clientX - preTouch.clientX
        const diffY = clientY - preTouch.clientY
        this.x += diffX
        this.y += diffY

        this.#avatar.x += diffX
        this.#avatar.y += diffY
        this.#avatar.updateRenderPosition()
      }
    }

    if (touches.length === 2 && this.#isHover) {
      let oldTouchA = this.#trackingTouches.get(touches[0].identifier)
      let oldTouchB = this.#trackingTouches.get(touches[1].identifier)
      if (oldTouchA && oldTouchB) {
        let newDistance = this.#getDistance(touches[0], touches[1])
        let oldDistance = this.#getDistance(oldTouchA, oldTouchB)
        let scale = newDistance > oldDistance ? 1.02 : 0.98
        this.#zoom(scale)
      }
    }

    // update tracking touches
    for (let i = 0; i < touches.length; i++) {
      this.#trackingTouches.set(touches[i].identifier, touches[i])
    }
  }

  #removeTrackingTouches(touchList: TouchList) {
    for (let i = 0; i < touchList.length; i++) {
      this.#trackingTouches.delete(touchList[i].identifier)
    }

    if (!this.#trackingTouches.size) {
      this.#isHover = false
    }
  }

  #getDistance(touchA: Touch, touchB: Touch) {
    const distanceX = Math.abs(touchA.clientX - touchB.clientX)
    const distanceY = Math.abs(touchA.clientY - touchB.clientY)
    return Math.pow(distanceX, 2) + Math.pow(distanceY, 2)
  }

  #zoom(scale: number) {
    const widthDiff = this.width * scale - this.width
    const heightDiff = this.height * scale - this.height
    this.x = this.x - widthDiff / 2
    this.width = this.width + widthDiff
    this.y = this.y - heightDiff / 2
    this.height = this.height + heightDiff

    this.#avatar.x = this.x
    this.#avatar.y = this.y
    this.#avatar.width = this.width
    this.#avatar.height = this.height
    this.#avatar.updateRenderPosition()
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
