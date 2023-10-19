import store, { addListener, reset } from '../../store'
import type FontSelect from '../FontSelect'
import type RangeSlider from '../RangeSlider'
import cssContent from './style.css?inline'
import templateContent from './template.html?raw'

const TAG_NAME = 'edit-panel'

const template = document.createElement('template')
template.innerHTML = templateContent

class EditPanel extends HTMLElement {
  #nameInput: HTMLInputElement
  #bountyInput: HTMLInputElement

  #nameSpacingSlider: RangeSlider
  #bountyFontFamilySelect: FontSelect
  #bountySpacingSlider: RangeSlider
  #bountyFontScaleSlider: RangeSlider
  #bountyFontWeightSlider: RangeSlider
  #bountyOffsetSlider: RangeSlider
  #posterShadowSlider: RangeSlider
  #photoShadowSlider: RangeSlider
  #blurSlider: RangeSlider
  #brightnessSlider: RangeSlider
  #contrastSlider: RangeSlider
  #grayscaleSlider: RangeSlider
  #hueRotateSlider: RangeSlider
  #saturateSlider: RangeSlider
  #sepiaSlider: RangeSlider

  #closeButton: HTMLButtonElement
  #resetButton: HTMLButtonElement

  #pointerdownListener: (e: PointerEvent) => void
  #storeListener: Parameters<typeof addListener>[1]

  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = cssContent

    shadowRoot.append(style, template.content.cloneNode(true))

    this.#nameInput = shadowRoot.querySelector<HTMLInputElement>('#nameInput')!
    this.#bountyInput =
      shadowRoot.querySelector<HTMLInputElement>('#bountyInput')!

    this.#nameSpacingSlider =
      shadowRoot.querySelector<RangeSlider>('#nameSpacingSlider')!

    this.#bountyFontFamilySelect = shadowRoot.querySelector<FontSelect>(
      '#bountyFontFamilySelect'
    )!
    this.#bountySpacingSlider = shadowRoot.querySelector<RangeSlider>(
      '#bountySpacingSlider'
    )!
    this.#bountyFontScaleSlider = shadowRoot.querySelector<RangeSlider>(
      '#bountyFontScaleSlider'
    )!
    this.#bountyFontWeightSlider = shadowRoot.querySelector<RangeSlider>(
      '#bountyFontWeightSlider'
    )!
    this.#bountyOffsetSlider = shadowRoot.querySelector<RangeSlider>(
      '#bountyOffsetSlider'
    )!
    this.#posterShadowSlider = shadowRoot.querySelector<RangeSlider>(
      '#posterShadowSlider'
    )!
    this.#photoShadowSlider =
      shadowRoot.querySelector<RangeSlider>('#photoShadowSlider')!
    this.#blurSlider = shadowRoot.querySelector<RangeSlider>('#blurSlider')!
    this.#brightnessSlider =
      shadowRoot.querySelector<RangeSlider>('#brightnessSlider')!
    this.#contrastSlider =
      shadowRoot.querySelector<RangeSlider>('#contrastSlider')!
    this.#grayscaleSlider =
      shadowRoot.querySelector<RangeSlider>('#grayscaleSlider')!
    this.#hueRotateSlider =
      shadowRoot.querySelector<RangeSlider>('#hueRotateSlider')!
    this.#saturateSlider =
      shadowRoot.querySelector<RangeSlider>('#saturateSlider')!
    this.#sepiaSlider = shadowRoot.querySelector<RangeSlider>('#sepiaSlider')!

    this.#closeButton =
      shadowRoot.querySelector<HTMLButtonElement>('#closeButton')!
    this.#resetButton =
      shadowRoot.querySelector<HTMLButtonElement>('#resetButton')!

    this.#storeListener = (key, value) => {
      value = value.toString()
      switch (key) {
        case 'name':
          this.#nameInput.value = value
          break
        case 'bounty':
          this.#bountyInput.value = value
          break
        case 'nameSpacing':
          this.#nameSpacingSlider.value = value
          break
        case 'bountySpacing':
          this.#bountySpacingSlider.value = value
          break
        case 'bountyFontFamily':
          this.#bountyFontFamilySelect.value = value
          break
        case 'bountyFontScale':
          this.#bountyFontScaleSlider.value = value
          break
        case 'bountyFontWeight':
          this.#bountyFontWeightSlider.value = value
          break
        case 'bountyVerticalOffset':
          this.#bountyOffsetSlider.value = value
          break
        case 'posterShadow':
          this.#posterShadowSlider.value = value
          break
        case 'photoShadow':
          this.#photoShadowSlider.value = value
          break
        case 'blur':
          this.#blurSlider.value = value
          break
        case 'brightness':
          this.#brightnessSlider.value = value
          break
        case 'contrast':
          this.#contrastSlider.value = value
          break
        case 'grayscale':
          this.#grayscaleSlider.value = value
          break
        case 'hueRotate':
          this.#hueRotateSlider.value = value
          break
        case 'saturate':
          this.#saturateSlider.value = value
          break
        case 'sepia':
          this.#sepiaSlider.value = value
          break
      }
    }

    // close when user click outside of edit-panel
    this.#pointerdownListener = (e: PointerEvent) => {
      const isInside = e.composedPath().includes(this)
      if (isInside) {
        return
      }
      this.classList.contains('open') && this.toggle()
    }
  }

  toggle() {
    this.classList.toggle('open')
  }

  connectedCallback() {
    window.addEventListener('pointerdown', this.#pointerdownListener)

    addListener('name', this.#storeListener)
    addListener('bounty', this.#storeListener)
    addListener('nameSpacing', this.#storeListener)
    addListener('bountySpacing', this.#storeListener)
    addListener('bountyFontFamily', this.#storeListener)
    addListener('bountyFontScale', this.#storeListener)
    addListener('bountyFontWeight', this.#storeListener)
    addListener('bountyVerticalOffset', this.#storeListener)
    addListener('posterShadow', this.#storeListener)
    addListener('photoShadow', this.#storeListener)
    addListener('blur', this.#storeListener)
    addListener('saturate', this.#storeListener)
    addListener('contrast', this.#storeListener)
    addListener('grayscale', this.#storeListener)
    addListener('hueRotate', this.#storeListener)
    addListener('hueRotate', this.#storeListener)
    addListener('sepia', this.#storeListener)

    this.#nameInput.value = store.name
    this.#bountyInput.value = store.bounty.toString()

    this.#nameSpacingSlider.value = store.nameSpacing.toString()
    this.#bountySpacingSlider.value = store.bountySpacing.toString()
    this.#bountyFontFamilySelect.value = store.bountyFontFamily.toString()
    this.#bountyFontScaleSlider.value = store.bountyFontScale.toString()
    this.#bountyFontWeightSlider.value = store.bountyFontWeight.toString()
    this.#bountyOffsetSlider.value = store.bountyVerticalOffset.toString()
    this.#posterShadowSlider.value = store.posterShadow.toString()
    this.#photoShadowSlider.value = store.photoShadow.toString()
    this.#blurSlider.value = store.blur.toString()
    this.#brightnessSlider.value = store.brightness.toString()
    this.#contrastSlider.value = store.contrast.toString()
    this.#grayscaleSlider.value = store.grayscale.toString()
    this.#hueRotateSlider.value = store.hueRotate.toString()
    this.#saturateSlider.value = store.saturate.toString()
    this.#sepiaSlider.value = store.sepia.toString()

    // name
    this.#nameInput.addEventListener(
      'input',
      () => (store.name = this.#nameInput.value)
    )
    this.#nameSpacingSlider.addEventListener(
      'input',
      () => (store.nameSpacing = parseFloat(this.#nameSpacingSlider.value))
    )

    // bounty
    this.#bountyInput.addEventListener(
      'input',
      () => (store.bounty = this.#bountyInput.value)
    )
    this.#bountyFontFamilySelect.addEventListener('input', () => {
      store.bountyFontFamily = this.#bountyFontFamilySelect.value
    })
    this.#bountySpacingSlider.addEventListener('input', () => {
      store.bountySpacing = parseFloat(this.#bountySpacingSlider.value)
    })
    this.#bountyFontScaleSlider.addEventListener('input', () => {
      store.bountyFontScale = parseFloat(this.#bountyFontScaleSlider.value)
    })
    this.#bountyFontWeightSlider.addEventListener('input', () => {
      store.bountyFontWeight = parseFloat(this.#bountyFontWeightSlider.value)
    })
    this.#bountyOffsetSlider.addEventListener('input', () => {
      store.bountyVerticalOffset = parseFloat(this.#bountyOffsetSlider.value)
    })

    // filter
    this.#photoShadowSlider.addEventListener(
      'input',
      () => (store.photoShadow = parseFloat(this.#photoShadowSlider.value))
    )
    this.#blurSlider.addEventListener(
      'input',
      () => (store.blur = parseFloat(this.#blurSlider.value))
    )
    this.#brightnessSlider.addEventListener(
      'input',
      () => (store.brightness = parseFloat(this.#brightnessSlider.value))
    )
    this.#contrastSlider.addEventListener(
      'input',
      () => (store.contrast = parseFloat(this.#contrastSlider.value))
    )
    this.#grayscaleSlider.addEventListener(
      'input',
      () => (store.grayscale = parseFloat(this.#grayscaleSlider.value))
    )
    this.#hueRotateSlider.addEventListener(
      'input',
      () => (store.hueRotate = parseFloat(this.#hueRotateSlider.value))
    )
    this.#saturateSlider.addEventListener(
      'input',
      () => (store.saturate = parseFloat(this.#saturateSlider.value))
    )
    this.#sepiaSlider.addEventListener(
      'input',
      () => (store.sepia = parseFloat(this.#sepiaSlider.value))
    )

    // other
    this.#posterShadowSlider.addEventListener(
      'input',
      () => (store.posterShadow = parseFloat(this.#posterShadowSlider.value))
    )

    this.#closeButton.addEventListener('click', () => this.toggle())
    this.#resetButton.addEventListener('click', () =>
      reset({ photoUrl: store.photoUrl })
    )
  }
}

customElements.define(TAG_NAME, EditPanel)

export default EditPanel
