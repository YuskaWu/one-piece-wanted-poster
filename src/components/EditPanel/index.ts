import cssContent from './style.css?inline'
import templateContent from './template.html?raw'
import store, { addListener, removeListener, reset } from '../../store'

const TAG_NAME = 'edit-panel'

const template = document.createElement('template')
template.innerHTML = templateContent

class EditPanel extends HTMLElement {
  #isOpening = false
  #nameInput: HTMLInputElement
  #bountyInput: HTMLInputElement

  #nameSpacingSlider: HTMLInputElement
  #bountySpacingSlider: HTMLInputElement
  #paddingSlider: HTMLInputElement
  #blurSlider: HTMLInputElement
  #brightnessSlider: HTMLInputElement
  #contrastSlider: HTMLInputElement
  #grayscaleSlider: HTMLInputElement
  #hueRotateSlider: HTMLInputElement
  #saturateSlider: HTMLInputElement
  #sepiaSlider: HTMLInputElement

  #closeButton: HTMLButtonElement
  #resetButton: HTMLButtonElement

  #pointerdownListener: (e: PointerEvent) => void
  #storeListener: Parameters<typeof addListener>[1]

  constructor() {
    super()

    // Create a shadow root
    const shadowRoot = this.attachShadow({ mode: 'open' })
    // this.#root = shadowRoot

    const style = document.createElement('style')
    style.textContent = cssContent

    // attach the created elements to the shadow DOM
    shadowRoot.append(style, template.content.cloneNode(true))

    this.#nameInput = shadowRoot.querySelector<HTMLInputElement>('#nameInput')!
    this.#bountyInput =
      shadowRoot.querySelector<HTMLInputElement>('#bountyInput')!

    this.#nameSpacingSlider =
      shadowRoot.querySelector<HTMLInputElement>('#nameSpacingSlider')!
    this.#bountySpacingSlider = shadowRoot.querySelector<HTMLInputElement>(
      '#bountySpacingSlider'
    )!
    this.#paddingSlider =
      shadowRoot.querySelector<HTMLInputElement>('#paddingSlider')!
    this.#blurSlider =
      shadowRoot.querySelector<HTMLInputElement>('#blurSlider')!
    this.#brightnessSlider =
      shadowRoot.querySelector<HTMLInputElement>('#brightnessSlider')!
    this.#contrastSlider =
      shadowRoot.querySelector<HTMLInputElement>('#contrastSlider')!
    this.#grayscaleSlider =
      shadowRoot.querySelector<HTMLInputElement>('#grayscaleSlider')!
    this.#hueRotateSlider =
      shadowRoot.querySelector<HTMLInputElement>('#hueRotateSlider')!
    this.#saturateSlider =
      shadowRoot.querySelector<HTMLInputElement>('#saturateSlider')!
    this.#sepiaSlider =
      shadowRoot.querySelector<HTMLInputElement>('#sepiaSlider')!

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
        case 'padding':
          this.#paddingSlider.value = value
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
      if (e.target instanceof Node && this.contains(e.target)) {
        return
      }
      this.toggle(false)
    }
  }

  toggle(open: boolean) {
    if (open) {
      this.#isOpening = true
      this.classList.add('open')
      setTimeout(() => {
        this.#isOpening = false
      }, 200)

      return
    }

    !this.#isOpening && this.classList.remove('open')
  }

  connectedCallback() {
    window.addEventListener('pointerdown', this.#pointerdownListener)

    addListener('name', this.#storeListener)
    addListener('bounty', this.#storeListener)
    addListener('nameSpacing', this.#storeListener)
    addListener('bountySpacing', this.#storeListener)
    addListener('padding', this.#storeListener)
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
    this.#paddingSlider.value = store.padding.toString()
    this.#blurSlider.value = store.blur.toString()
    this.#brightnessSlider.value = store.brightness.toString()
    this.#contrastSlider.value = store.contrast.toString()
    this.#grayscaleSlider.value = store.grayscale.toString()
    this.#hueRotateSlider.value = store.hueRotate.toString()
    this.#saturateSlider.value = store.saturate.toString()
    this.#sepiaSlider.value = store.sepia.toString()

    this.#nameInput.addEventListener(
      'input',
      () => (store.name = this.#nameInput.value)
    )
    this.#bountyInput.addEventListener(
      'input',
      () => (store.bounty = this.#bountyInput.value)
    )

    this.#nameSpacingSlider.addEventListener(
      'input',
      () => (store.nameSpacing = parseInt(this.#nameSpacingSlider.value))
    )
    this.#bountySpacingSlider.addEventListener(
      'input',
      () => (store.bountySpacing = parseInt(this.#bountySpacingSlider.value))
    )
    this.#paddingSlider.addEventListener(
      'input',
      () => (store.padding = parseInt(this.#paddingSlider.value))
    )
    this.#blurSlider.addEventListener(
      'input',
      () => (store.blur = parseInt(this.#blurSlider.value))
    )
    this.#brightnessSlider.addEventListener(
      'input',
      () => (store.brightness = parseInt(this.#brightnessSlider.value))
    )
    this.#contrastSlider.addEventListener(
      'input',
      () => (store.contrast = parseInt(this.#contrastSlider.value))
    )
    this.#grayscaleSlider.addEventListener(
      'input',
      () => (store.grayscale = parseInt(this.#grayscaleSlider.value))
    )
    this.#hueRotateSlider.addEventListener(
      'input',
      () => (store.hueRotate = parseInt(this.#hueRotateSlider.value))
    )
    this.#saturateSlider.addEventListener(
      'input',
      () => (store.saturate = parseInt(this.#saturateSlider.value))
    )
    this.#sepiaSlider.addEventListener(
      'input',
      () => (store.sepia = parseInt(this.#sepiaSlider.value))
    )

    this.#closeButton.addEventListener('click', () => this.toggle(false))
    this.#resetButton.addEventListener('click', () => reset())
  }

  disconnectedCallback() {
    window.removeEventListener('pointerdown', this.#pointerdownListener)
    removeListener('name', this.#storeListener)
    removeListener('bounty', this.#storeListener)
    removeListener('padding', this.#storeListener)
    removeListener('blur', this.#storeListener)
    removeListener('saturate', this.#storeListener)
    removeListener('contrast', this.#storeListener)
    removeListener('grayscale', this.#storeListener)
    removeListener('hueRotate', this.#storeListener)
    removeListener('hueRotate', this.#storeListener)
    removeListener('sepia', this.#storeListener)
  }
}

customElements.define(TAG_NAME, EditPanel)

export default EditPanel
