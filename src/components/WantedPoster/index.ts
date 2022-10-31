import { downloadFile, getScale } from './utils'
import cssContent from './style.css?inline'
import { ONE_PIECE_WANTED_IMAGE } from './constants'

import Name from './Name'
import Avatar from './Avatar'
import Bounty from './Bounty'
import WantedImage from './WantedImage'
import AvatarResizer from './AvatarResizer'

const TAG_NAME = 'wanted-poster'
const ATTRIBUTES = [
  'name',
  'bounty',
  'avatar-url',
  'filter',
  'padding'
] as const

type Attributes = typeof ATTRIBUTES
export type WantedPosterAttribute = {
  [key in Attributes[number]]?: string
}

class WantedPoster extends HTMLElement {
  #container: HTMLDivElement
  #canvas: HTMLCanvasElement
  #ctx: CanvasRenderingContext2D

  #avatar: Avatar
  #avatarResizer: AvatarResizer
  #name: Name
  #bounty: Bounty
  #wantedImage: WantedImage
  #status: 'init' | 'loading' | 'success' | 'error'

  #resizeObserver: ResizeObserver
  #resizeTimeout?: number

  constructor() {
    super()
    this.#status = 'init'

    // Create a shadow root
    const shadowRoot = this.attachShadow({ mode: 'open' }) // sets and returns 'this.shadowRoot'

    const canvas = document.createElement('canvas')
    const container = document.createElement('div')
    container.className = 'container'
    container.appendChild(canvas)

    // Create some CSS to apply to the shadow dom
    const style = document.createElement('style')
    style.textContent = cssContent

    // attach the created elements to the shadow DOM
    shadowRoot.append(style, container)

    const ctx = canvas.getContext('2d')!

    this.#container = container
    this.#canvas = canvas
    this.#ctx = ctx

    this.#wantedImage = new WantedImage(ctx)
    this.#avatar = new Avatar(ctx)
    this.#name = new Name(ctx)
    this.#bounty = new Bounty(ctx)
    this.#avatarResizer = new AvatarResizer(ctx, this.#avatar)

    this.#resizeObserver = new ResizeObserver(() => {
      clearTimeout(this.#resizeTimeout)
      this.#resizeTimeout = window.setTimeout(() => this.#resize(), 200)
    })
    this.#resizeObserver.observe(container)
  }

  #getPadding() {
    const paddingAttr = this.getAttribute('padding')
    if (!paddingAttr) {
      return 0
    }

    const padding = Number.parseInt(paddingAttr)
    if (Number.isNaN(padding)) {
      return 0
    }

    return padding
  }

  async export() {
    const canvas = document.createElement('canvas')
    canvas.style.display = 'none'

    this.#container.appendChild(canvas)
    const ctx = canvas.getContext('2d')!

    const padding = this.#getPadding()
    const wantedImage = new WantedImage(ctx)
    const avatar = new Avatar(ctx)
    const name = new Name(ctx)
    const bounty = new Bounty(ctx)

    await wantedImage.loadImage(ONE_PIECE_WANTED_IMAGE)

    const exportWidth = ONE_PIECE_WANTED_IMAGE.width + padding * 2
    const exportHeight = ONE_PIECE_WANTED_IMAGE.height + padding * 2
    const { wantedImageInfo } = wantedImage.setSize({
      width: exportWidth,
      height: exportHeight,
      padding
    })

    await avatar.init(wantedImageInfo)
    await name.init(wantedImageInfo.namePosition)
    await bounty.init(wantedImageInfo)

    await avatar.loadImage(this.getAttribute('avatar-url'))
    name.text = this.getAttribute('name') ?? ''
    bounty.text = this.getAttribute('bounty') ?? ''

    // according to the avatar of displaying canvas to update render postion
    const { x, y, width, height, filter } = this.#avatar
    const scale = this.#wantedImage.scale
    avatar.x = x / scale
    avatar.y = y / scale
    avatar.width = width / scale
    avatar.height = height / scale
    avatar.filter = filter
    avatar.updateRenderPosition()

    avatar.render()
    wantedImage.render()
    bounty.render()
    name.render()

    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 1)
      })

      if (!blob) {
        throw new Error('blob is null')
      }

      const url = URL.createObjectURL(blob)
      downloadFile(url, 'wanted-poster.png')
      URL.revokeObjectURL(url)
      this.#container.removeChild(canvas)
    } catch (e) {
      console.error(e)
      // TODO catch event and show error message in parent component:
      // Oops! Seems the avatar image is cross origin and not allow to export.
      // You can right click on the canvas and save it by yourself.
      this.dispatchEvent(new CustomEvent('ExportError', { bubbles: true }))
    }
  }

  #resize() {
    if (this.#status !== 'success') {
      return
    }

    const padding = this.#getPadding()
    const rect = this.#container.getBoundingClientRect()

    const resizeScale = getScale(
      rect.width,
      rect.height,
      this.#canvas.width,
      this.#canvas.height
    )
    const { wantedImageInfo } = this.#wantedImage.setSize({
      width: rect.width,
      height: rect.height,
      padding
    })

    this.#name.setPosition(wantedImageInfo.namePosition)
    this.#bounty.setPosition(wantedImageInfo)

    this.#avatar.setWantedImageInfo(wantedImageInfo)
    this.#avatar.scale(resizeScale)
    this.#avatarResizer.scale(resizeScale)
  }

  #render() {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
    this.#avatar.render()
    this.#wantedImage.render()
    this.#bounty.render()
    this.#name.render()
    this.#avatarResizer.render()

    requestAnimationFrame(this.#render.bind(this))
  }

  static get observedAttributes(): Attributes {
    return ATTRIBUTES
  }

  async connectedCallback() {
    console.log('[connected]')

    // We need to get correct rect of container to calculate canvas's size,
    // but 'connectedCallback' hook does not mean element is fully parsed, therefor
    // here we wait a event loop cycle to make sure container is parsed.
    await new Promise((resolve) => {
      setTimeout(() => resolve(''))
    })

    this.#status = 'loading'
    const padding = this.#getPadding()
    const rect = this.#container.getBoundingClientRect()

    try {
      await this.#wantedImage.loadImage(ONE_PIECE_WANTED_IMAGE)
      const { wantedImageInfo } = this.#wantedImage.setSize({
        width: rect.width,
        height: rect.height,
        padding
      })

      await this.#avatar.init(wantedImageInfo)
      await this.#name.init(wantedImageInfo.namePosition)
      await this.#bounty.init(wantedImageInfo)

      await this.#avatar.loadImage(this.getAttribute('avatar-url'))
    } catch (e) {
      this.#status = 'error'
      console.error('Failed to init wanted poster.', e)
      return
    }

    this.#name.text = this.getAttribute('name') ?? ''
    this.#bounty.text = this.getAttribute('bounty') ?? ''

    const filter = this.getAttribute('filter')
    if (filter) {
      this.#avatar.filter = filter
    }

    this.#status = 'success'
    this.#render()
    this.dispatchEvent(new CustomEvent('WantedPosterLoaded', { bubbles: true }))
  }

  disconnectedCallback() {
    console.log('[disconnected]')
    this.#resizeObserver.disconnect()
  }

  adoptedCallback() {
    console.log('[adopted]')
  }

  async attributeChangedCallback(
    attributeName: Attributes[number],
    _: string,
    newValue: string
  ) {
    if (this.#status !== 'success') {
      return
    }
    switch (attributeName) {
      case 'name':
        this.#name.text = newValue
        break

      case 'bounty':
        this.#bounty.text = newValue
        break

      case 'avatar-url': {
        await this.#avatar.loadImage(newValue)
        break
      }

      case 'filter': {
        this.#avatar.filter = newValue
        break
      }

      case 'padding': {
        this.#resize()
        break
      }
    }
  }
}

customElements.define(TAG_NAME, WantedPoster)

export default WantedPoster
