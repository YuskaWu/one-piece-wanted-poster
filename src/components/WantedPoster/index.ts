import { ONE_PIECE_WANTED_IMAGE } from './constants'
import cssContent from './style.css?inline'
import { getFitScale } from './utils'

import type { PosterCanvasElement, PosterRenderingContext2D } from './types'

import Bounty from './Bounty'
import Name from './Name'
import Photo from './Photo'
import PhotoResizer from './PhotoResizer'
import WantedImage from './WantedImage'

const TAG_NAME = 'wanted-poster'
const ATTRIBUTES = [
  'name',
  'bounty',
  'name-spacing',
  'bounty-spacing',
  'bounty-font-family',
  'bounty-font-scale',
  'bounty-font-weight',
  'bounty-vertical-offset',
  'photo-url',
  'filter',
  'poster-shadow',
  'photo-shadow'
] as const

type Attributes = typeof ATTRIBUTES
export type WantedPosterAttribute = {
  [key in Attributes[number]]?: string
}

class WantedPoster extends HTMLElement {
  #container: HTMLDivElement
  #canvas: PosterCanvasElement
  #ctx: PosterRenderingContext2D

  #photo: Photo
  #photoResizer: PhotoResizer
  #name: Name
  #bounty: Bounty
  #wantedImage: WantedImage
  #status: 'init' | 'loading' | 'success' | 'error'

  #resizeObserver: ResizeObserver
  #resizeTimeout?: number

  constructor() {
    super()
    this.#status = 'init'

    const shadowRoot = this.attachShadow({ mode: 'open' })

    const canvas = document.createElement('canvas') as PosterCanvasElement
    canvas.domWidth = 0
    canvas.domHeight = 0
    const container = document.createElement('div')
    container.className = 'container'

    const style = document.createElement('style')
    style.textContent = cssContent

    shadowRoot.append(style, container)

    const ctx = canvas.getContext('2d') as PosterRenderingContext2D

    this.#container = container
    this.#canvas = canvas
    this.#ctx = ctx

    this.#wantedImage = new WantedImage(ctx, ONE_PIECE_WANTED_IMAGE)
    this.#photo = new Photo(ctx)
    this.#name = new Name(ctx)
    this.#bounty = new Bounty(ctx)
    this.#photoResizer = new PhotoResizer(ctx, this.#photo)

    this.#resizeObserver = new ResizeObserver(() => {
      clearTimeout(this.#resizeTimeout)
      this.#resizeTimeout = window.setTimeout(() => this.#resize(), 200)
    })
    this.#resizeObserver.observe(container)
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

    const posterShadow = this.#getAttrNumberValue('poster-shadow')
    const rect = this.#container.getBoundingClientRect()

    try {
      await this.#wantedImage.loadImage()

      const wantedImageInfo = this.#wantedImage.setSize({
        width: rect.width,
        height: rect.height,
        shadowSize: posterShadow,
        quality: 'half'
      })

      this.#name.setPosition(wantedImageInfo.namePosition)
      this.#bounty.setBountyInfo(
        wantedImageInfo.bountyInfo,
        this.#wantedImage.imageScale
      )

      await this.#bounty.loadBellyImage(ONE_PIECE_WANTED_IMAGE.bellyImageUrl)
      await this.#photo.init(
        wantedImageInfo.photoPosition,
        wantedImageInfo.boundaryOffset
      )
      await this.#photo.loadImage(this.getAttribute('photo-url'))
    } catch (e) {
      this.#status = 'error'
      console.error('Failed to init wanted poster.', e)
      return
    }

    this.#status = 'success'

    this.#render()
    // defer appending canvas here to avoid CLS(Cumulative Layout Shift)
    this.#container.appendChild(this.#canvas)
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
    switch (attributeName) {
      case 'name':
        this.#name.text = newValue
        break

      case 'bounty':
        this.#bounty.text = newValue
        break

      case 'name-spacing':
        this.#name.spacing = parseFloat(newValue) || 0
        break

      case 'bounty-spacing':
        this.#bounty.spacing = parseFloat(newValue) || 0
        break

      case 'bounty-font-family':
        this.#bounty.fontFamily = newValue
        break

      case 'bounty-font-scale':
        this.#bounty.fontScale = parseFloat(newValue) || 1
        break

      case 'bounty-font-weight':
        this.#bounty.fontWeight = parseFloat(newValue) || 600
        break

      case 'bounty-vertical-offset':
        this.#bounty.verticalOffset = parseFloat(newValue) || 0
        break

      case 'photo-url': {
        await this.#photo.loadImage(newValue)
        this.#photoResizer.highlight = newValue.endsWith('#nohighlight')
          ? false
          : true
        break
      }

      case 'filter': {
        this.#photo.filter = newValue
        break
      }

      case 'poster-shadow': {
        this.#resize()
        break
      }

      case 'photo-shadow': {
        this.#photo.shadow = parseFloat(newValue) || 0
      }
    }
  }

  #getAttrNumberValue(
    attr: Attributes[number],
    defaultValue: number = 0
  ): number {
    const value = this.getAttribute(attr) || ''
    return parseFloat(value) || defaultValue
  }

  async export() {
    const canvas = document.createElement('canvas') as PosterCanvasElement
    canvas.domWidth = 0
    canvas.domHeight = 0
    canvas.style.display = 'none'

    const ctx = canvas.getContext('2d') as PosterRenderingContext2D

    const posterShadow = this.#getAttrNumberValue('poster-shadow')
    const wantedImage = new WantedImage(ctx, ONE_PIECE_WANTED_IMAGE)
    const photo = new Photo(ctx)
    const name = new Name(ctx)
    const bounty = new Bounty(ctx)

    const image = await wantedImage.loadImage()

    const exportWidth = image.width + posterShadow * 2
    const exportHeight = image.height + posterShadow * 2

    const wantedImageInfo = wantedImage.setSize({
      width: exportWidth,
      height: exportHeight,
      shadowSize: posterShadow,
      quality: 'original'
    })

    await bounty.loadBellyImage(wantedImageInfo.bellyImageUrl)
    name.setPosition(wantedImageInfo.namePosition)
    bounty.setBountyInfo(wantedImageInfo.bountyInfo, 1)
    name.text = this.getAttribute('name') ?? ''
    bounty.text = this.getAttribute('bounty') ?? ''
    name.spacing = this.#getAttrNumberValue('name-spacing')
    bounty.spacing = this.#getAttrNumberValue('bounty-spacing')
    bounty.fontFamily = this.getAttribute('bounty-font-family') ?? ''
    bounty.fontScale = this.#getAttrNumberValue('bounty-font-scale', 1)
    bounty.fontWeight = this.#getAttrNumberValue('bounty-font-weight')
    bounty.verticalOffset = this.#getAttrNumberValue('bounty-vertical-offset')

    await photo.init(
      wantedImageInfo.photoPosition,
      wantedImageInfo.boundaryOffset
    )
    await photo.loadImage(this.getAttribute('photo-url'))

    photo.shadow = this.#getAttrNumberValue('photo-shadow')
    // sync photo position from current displaying canvas
    const { x, y, width, height, filter } = this.#photo
    photo.x = x / this.#wantedImage.imageScale
    photo.y = y / this.#wantedImage.imageScale
    photo.width = width / this.#wantedImage.imageScale
    photo.height = height / this.#wantedImage.imageScale
    photo.filter = filter

    photo.updateRenderPosition()

    photo.render()
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
      this.#downloadFile(url, 'wanted-poster.png')
    } finally {
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  }

  #downloadFile(uri: string, fileName: string) {
    const anchor = document.createElement('a')
    anchor.setAttribute('href', uri)
    anchor.setAttribute('download', fileName)
    anchor.style.display = 'none'

    document.body.appendChild(anchor)

    anchor.click()
    anchor.remove()
  }

  #resize() {
    if (this.#status !== 'success') {
      return
    }

    const posterShadow = this.#getAttrNumberValue('poster-shadow')
    const containerRect = this.#container.getBoundingClientRect()
    const canvasRect = this.#canvas.getBoundingClientRect()

    const resizeScale = getFitScale(
      containerRect.width,
      containerRect.height,
      canvasRect.width,
      canvasRect.height
    )
    const wantedImageInfo = this.#wantedImage.setSize({
      width: containerRect.width,
      height: containerRect.height,
      shadowSize: posterShadow,
      quality: 'half'
    })

    this.#name.setPosition(wantedImageInfo.namePosition)
    this.#bounty.setBountyInfo(
      wantedImageInfo.bountyInfo,
      this.#wantedImage.imageScale
    )

    this.#photo.setBoundary(
      wantedImageInfo.photoPosition,
      wantedImageInfo.boundaryOffset
    )
    this.#photoResizer.scale(resizeScale)
    this.#photoResizer.borderScale = this.#wantedImage.imageScale
  }

  #render() {
    this.#ctx.clearRect(0, 0, this.#canvas.domWidth, this.#canvas.domHeight)
    this.#photo.render()
    this.#wantedImage.render()
    this.#bounty.render()
    this.#name.render()
    this.#photoResizer.render()

    requestAnimationFrame(this.#render.bind(this))
  }
}

customElements.define(TAG_NAME, WantedPoster)

export default WantedPoster
