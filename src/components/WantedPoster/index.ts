import { WARCRIMINAL_POSTER } from '../App/config'
import { ONE_PIECE_WANTED_IMAGE } from './constants'
import cssContent from './style.css?inline'
import { downloadFile, getScale } from './utils'

import Avatar from './Avatar'
import AvatarResizer from './AvatarResizer'
import Bounty from './Bounty'
import Name from './Name'
import WantedImage from './WantedImage'

const TAG_NAME = 'wanted-poster'
const ATTRIBUTES = [
  'name',
  'bounty',
  'name-spacing',
  'bounty-spacing',
  'avatar-url',
  'filter',
  'shadow'
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

  #getShadow() {
    const shadowAttr = this.getAttribute('shadow')
    if (!shadowAttr) {
      return 0
    }

    const shadow = Number.parseInt(shadowAttr)
    if (Number.isNaN(shadow)) {
      return 0
    }

    return shadow
  }

  async export() {
    const canvas = document.createElement('canvas')
    canvas.style.display = 'none'

    this.#container.appendChild(canvas)
    const ctx = canvas.getContext('2d')!

    const shadow = this.#getShadow()
    const wantedImage = new WantedImage(ctx)
    const avatar = new Avatar(ctx)
    const name = new Name(ctx)
    const bounty = new Bounty(ctx)

    const image = await wantedImage.loadImage(ONE_PIECE_WANTED_IMAGE)

    const exportWidth = image.width + shadow * 2
    const exportHeight = image.height + shadow * 2
    const { wantedImageInfo } = wantedImage.setSize({
      width: exportWidth,
      height: exportHeight,
      shadowSize: shadow
    })

    await bounty.init()
    await avatar.init(wantedImageInfo)
    name.setPosition(wantedImageInfo.namePosition)
    bounty.setPosition(wantedImageInfo, 1)

    await avatar.loadImage(this.getAttribute('avatar-url'))
    name.text = this.getAttribute('name') ?? ''
    bounty.text = this.getAttribute('bounty') ?? ''
    name.spacing = parseInt(this.getAttribute('name-spacing') ?? '0') || 0
    bounty.spacing = parseInt(this.getAttribute('bounty-spacing') ?? '0') || 0

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

    let url = ''
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            blob ? resolve(blob) : reject('Failed to create blob object.')
          },
          'image/png',
          1
        )
      })
      url = URL.createObjectURL(blob)
      downloadFile(url, 'wanted-poster.png')
    } catch (e) {
      throw e
    } finally {
      if (url) {
        URL.revokeObjectURL(url)
      }
      this.#container.removeChild(canvas)
    }
  }

  #resize() {
    if (this.#status !== 'success') {
      return
    }

    const shadow = this.#getShadow()
    const rect = this.#container.getBoundingClientRect()

    const resizeScale = getScale(
      rect.width,
      rect.height,
      this.#canvas.width,
      this.#canvas.height
    )
    const { wantedImageInfo, scale } = this.#wantedImage.setSize({
      width: rect.width,
      height: rect.height,
      shadowSize: shadow
    })

    this.#name.setPosition(wantedImageInfo.namePosition)
    this.#bounty.setPosition(wantedImageInfo, scale)

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
    const shadow = this.#getShadow()
    const rect = this.#container.getBoundingClientRect()

    try {
      await this.#wantedImage.loadImage(ONE_PIECE_WANTED_IMAGE)
      const { wantedImageInfo, scale } = this.#wantedImage.setSize({
        width: rect.width,
        height: rect.height,
        shadowSize: shadow
      })

      await this.#bounty.init()
      await this.#avatar.init(wantedImageInfo)
      this.#name.setPosition(wantedImageInfo.namePosition)
      this.#bounty.setPosition(wantedImageInfo, scale)

      await this.#avatar.loadImage(this.getAttribute('avatar-url'))
    } catch (e) {
      this.#status = 'error'
      console.error('Failed to init wanted poster.', e)
      return
    }

    this.#name.text = this.getAttribute('name') ?? ''
    this.#bounty.text = this.getAttribute('bounty') ?? ''
    this.#name.spacing = parseInt(this.getAttribute('name-spacing') ?? '0') || 0
    this.#bounty.spacing =
      parseInt(this.getAttribute('bounty-spacing') ?? '0') || 0

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

      case 'name-spacing':
        this.#name.spacing = parseInt(newValue) || 0
        break

      case 'bounty-spacing':
        this.#bounty.spacing = parseInt(newValue) || 0
        break

      case 'avatar-url': {
        await this.#avatar.loadImage(newValue)
        this.#avatarResizer.highlight = WARCRIMINAL_POSTER.avatarUrls.includes(
          newValue
        )
          ? false
          : true
        break
      }

      case 'filter': {
        this.#avatar.filter = newValue
        break
      }

      case 'shadow': {
        this.#resize()
        break
      }
    }
  }
}

customElements.define(TAG_NAME, WantedPoster)

export default WantedPoster
