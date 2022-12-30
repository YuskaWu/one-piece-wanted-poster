import cssContent from './style.css?inline'
import templateContent from './template.html?raw'
import ButtonImageUrl from './wanted.png'

type Attributes = typeof ATTRIBUTES
export type WantedPosterAttribute = Partial<{
  [key in Attributes[number]]: string
}>

const TAG_NAME = 'wanted-button'
const ATTRIBUTES = ['font-size'] as const

const template = document.createElement('template')
template.innerHTML = templateContent

class WantedButton extends HTMLElement {
  #root: ShadowRoot
  #textElm: HTMLSpanElement

  constructor() {
    super()

    // Create a shadow root
    const shadowRoot = this.attachShadow({ mode: 'open' })
    this.#root = shadowRoot
    const style = document.createElement('style')
    style.textContent = cssContent

    // attach the created elements to the shadow DOM
    shadowRoot.append(style, template.content.cloneNode(true))

    shadowRoot.querySelector('img')?.setAttribute('src', ButtonImageUrl)
    this.#textElm = shadowRoot.querySelector('span.text') as HTMLSpanElement
  }

  static get observedAttributes(): Attributes {
    return ATTRIBUTES
  }

  set loading(value: boolean) {
    const iconSlot =
      this.#root.querySelector<HTMLSlotElement>('slot[name=icon]')
    const elm = iconSlot?.assignedNodes()[0] as undefined | HTMLElement

    if (elm) {
      elm.style.display = value ? 'none' : 'inline'
    }

    if (value) {
      this.setAttribute('loading', '')
    } else {
      this.removeAttribute('loading')
    }
  }

  get loading(): boolean {
    return this.hasAttribute('loading')
  }

  attributeChangedCallback(
    attributeName: Attributes[number],
    _: string,
    newValue: string
  ) {
    switch (attributeName) {
      case 'font-size':
        this.#textElm.style.fontSize = newValue
        break
    }
  }
}

customElements.define(TAG_NAME, WantedButton)

export default WantedButton
