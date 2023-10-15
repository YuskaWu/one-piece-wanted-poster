import cssContent from './style.css?inline'
import templateContent from './template.html?raw'

type Attributes = typeof ATTRIBUTES

const TAG_NAME = 'range-slider'
const ATTRIBUTES = ['value', 'max', 'min', 'step'] as const

const template = document.createElement('template')
template.innerHTML = templateContent

const thumbOffsetStart = 5.5
const thumbOffsetRange = 12.5

class RangeSlider extends HTMLElement {
  #input: HTMLInputElement
  #thumbText: HTMLSpanElement

  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = cssContent

    shadowRoot.append(style, template.content.cloneNode(true))

    this.#input = shadowRoot.querySelector('input') as HTMLInputElement
    this.#thumbText = shadowRoot.querySelector('#thumbText') as HTMLSpanElement

    this.#input.addEventListener('input', () => this.#updateThumbTextPosition())
  }

  #updateThumbTextPosition() {
    const max = parseFloat(this.#input.max)
    const min = parseFloat(this.#input.min)
    const value = parseFloat(this.#input.value)

    const percent = ((value - min) / (max - min)) * 100
    this.#thumbText.innerText = this.value

    const translateX =
      -percent + (thumbOffsetStart - (thumbOffsetRange * percent) / 100)

    const wrapper = this.#thumbText.parentElement!
    wrapper.style.left = percent + '%'
    wrapper.style.transform = `translateX(${translateX}%)`
  }

  get value() {
    return this.#input.value
  }

  set value(v: string) {
    this.#input.value = v
    this.#thumbText.innerText = v
    this.#updateThumbTextPosition()
  }

  static get observedAttributes(): Attributes {
    return ATTRIBUTES
  }

  attributeChangedCallback(
    attributeName: Attributes[number],
    _: string,
    newValue: string
  ) {
    switch (attributeName) {
      case 'value':
        this.value = newValue
        break

      default:
        this.#input.setAttribute(attributeName, newValue)
        break
    }
  }
}

customElements.define(TAG_NAME, RangeSlider)

export default RangeSlider
