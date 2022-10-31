import Avatar from './Avatar'
import CanvasObject from './CanvasObject'
import { getBorderHoverInfo, isInside } from './utils'

class AvatarResizer extends CanvasObject {
  #avatar: Avatar
  #highlight = false
  #isHover = false
  #isMousedown = false
  #isResizing = false
  #borderWidth = 4
  #resizeBorder: 'left' | 'right' | 'top' | 'bottom' | null = null

  #trackingPointers: Map<number, PointerEvent> = new Map()

  #dashOffset = 0

  #mouseClientX = 0
  #mouseClientY = 0

  constructor(ctx: CanvasRenderingContext2D, avatar: Avatar) {
    super(ctx)
    this.#avatar = avatar

    avatar.on('imageloaded', () => this.reset())
    ctx.canvas.addEventListener('mouseout', this.#onMouseout.bind(this), {
      passive: true
    })
    ctx.canvas.addEventListener('wheel', this.#onWheel.bind(this), {
      passive: true
    })

    ctx.canvas.addEventListener('pointerdown', this.#onPointerdown.bind(this), {
      passive: true
    })
    ctx.canvas.addEventListener('pointerup', this.#onPointerup.bind(this), {
      passive: true
    })
    ctx.canvas.addEventListener(
      'pointercancel',
      this.#onPointercancel.bind(this),
      {
        passive: true
      }
    )
    ctx.canvas.addEventListener('pointermove', this.#onPointermove.bind(this), {
      passive: true
    })
    ctx.canvas.addEventListener('pointerout', this.#onPointerout.bind(this), {
      passive: true
    })
  }

  set highlight(value: boolean) {
    this.#highlight = value
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

  #onWheel(e: WheelEvent) {
    const scale = e.deltaY > 0 ? 0.95 : 1.05
    this.#zoom(scale)
  }

  #onMouseout() {
    this.#isHover = false
  }

  #onMousemove(e: MouseEvent) {
    const { left, top } = this.ctx.canvas.getBoundingClientRect()
    const canvasX = e.clientX - left
    const canvasY = e.clientY - top

    if (this.#isMousedown) {
      const diffX = e.clientX - this.#mouseClientX
      const diffY = e.clientY - this.#mouseClientY
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
      this.#highlight = false
    } else {
      this.#isHover = false
    }

    this.#mouseClientX = e.clientX
    this.#mouseClientY = e.clientY
  }

  #onPointerdown(e: PointerEvent) {
    this.#highlight = false

    if (e.pointerType === 'mouse' && e.button === 0) {
      this.#isMousedown = true
      return
    }

    this.#trackingPointers.set(e.pointerId, e)
    const { left, top } = this.ctx.canvas.getBoundingClientRect()
    let isHover = false
    for (let pointer of this.#trackingPointers.values()) {
      const canvasX = pointer.clientX - left
      const canvasY = pointer.clientY - top

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

  // pointer lifts off the surface
  #onPointerup(e: PointerEvent) {
    if (e.pointerType === 'mouse' && e.button === 0) {
      this.#isMousedown = false
      this.#isResizing = false
      return
    }

    this.#removeTrackingPointer(e)
  }

  // cancel by system:
  // (for more detail see https://developer.mozilla.org/en-US/docs/Web/API/Element/pointercancel_event)
  // a. user switching applications
  // b. The device's screen orientation is changed
  // c. The browser decides that the user started pointer input accidentally.
  // d. The touch-action CSS property prevents the input from continuing.
  #onPointercancel(e: PointerEvent) {
    this.#removeTrackingPointer(e)
  }

  #onPointermove(e: PointerEvent) {
    if (e.pointerType === 'mouse') {
      this.#onMousemove(e)
      return
    }

    const pointers = Array.from(this.#trackingPointers.values())

    if (pointers.length === 1 && this.#isHover) {
      const pointer = pointers[0]
      const { clientX, clientY } = e

      const oldPointer = this.#trackingPointers.get(pointer.pointerId)
      // move resizer
      if (oldPointer) {
        const diffX = clientX - oldPointer.clientX
        const diffY = clientY - oldPointer.clientY
        this.x += diffX
        this.y += diffY

        this.#avatar.x += diffX
        this.#avatar.y += diffY
        this.#avatar.updateRenderPosition()
      }
    }

    if (pointers.length === 2 && this.#isHover) {
      let oldPointerA = this.#trackingPointers.get(pointers[0].pointerId)
      let oldPointerB = this.#trackingPointers.get(pointers[1].pointerId)
      if (oldPointerA && oldPointerB) {
        const datumPointer =
          pointers[0].pointerId === e.pointerId ? pointers[1] : pointers[0]
        let newDistance = this.#getDistance(datumPointer, e)
        let oldDistance = this.#getDistance(oldPointerA, oldPointerB)
        let scale = newDistance > oldDistance ? 1.02 : 0.98
        this.#zoom(scale)
      }
    }

    // update pointer
    this.#trackingPointers.set(e.pointerId, e)
  }

  #onPointerout(e: PointerEvent) {
    if (e.pointerType === 'mouse') {
      this.#isMousedown = false
      this.#isResizing = false
    }
  }

  #removeTrackingPointer(pointerEvent: PointerEvent) {
    this.#trackingPointers.delete(pointerEvent.pointerId)

    if (!this.#trackingPointers.size) {
      this.#isHover = false
    }
  }

  #getDistance(pointerA: PointerEvent, pointerB: PointerEvent) {
    const distanceX = Math.abs(pointerA.clientX - pointerB.clientX)
    const distanceY = Math.abs(pointerA.clientY - pointerB.clientY)
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
    if (!this.#isHover && !this.#isResizing && !this.#highlight) {
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
