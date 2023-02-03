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

    const shadowRoot = this.attachShadow({ mode: 'open' })
    this.#root = shadowRoot
    const style = document.createElement('style')
    style.textContent = cssContent

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

    if (iconSlot) {
      iconSlot.style.display = value ? 'none' : 'contents'
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
