import cssContent from './style.css?inline'
import templateContent from './template.html?raw'
import ButtonImageUrl from './wanted.png'

type Attributes = typeof ATTRIBUTES
export type WantedPosterAttribute = Partial<{
  [key in Attributes[number]]: string
}>

const TAG_NAME = 'wanted-button'
const ATTRIBUTES = ['icon', 'font-size', 'loading'] as const

const template = document.createElement('template')
template.innerHTML = templateContent

class WantedButton extends HTMLElement {
  #icon: string = ''
  #iconElm: HTMLElement
  #textElm: HTMLSpanElement

  constructor() {
    super()

    // Create a shadow root
    const shadowRoot = this.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    style.textContent = cssContent

    // attach the created elements to the shadow DOM
    shadowRoot.append(style, template.content.cloneNode(true))

    shadowRoot.querySelector('img')?.setAttribute('src', ButtonImageUrl)
    this.#iconElm = shadowRoot.querySelector('i.fa') as HTMLElement
    this.#textElm = shadowRoot.querySelector('span.text') as HTMLSpanElement

    // Since Web components are completely isolated entities, so parent or document style will
    // not be available inside a web component, that's why we clone font-awesome link element here
    // to make font-awesome work inside out custom button
    const fontawesomeLink = document.querySelector('link[href*="font-awesome"]')
    if (fontawesomeLink) {
      shadowRoot.appendChild(fontawesomeLink.cloneNode())
    }
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
      case 'icon':
        this.#icon = newValue
        this.#iconElm.classList.add(newValue)
        break

      case 'font-size':
        this.#textElm.style.fontSize = newValue
        break

      case 'loading':
        if (newValue !== null) {
          this.style.pointerEvents = 'none'
          this.#iconElm.classList.remove(this.#icon)
          this.#iconElm.classList.add('fa-circle-notch', 'fa-spin')
        } else {
          this.style.pointerEvents = 'auto'
          this.#iconElm.classList.remove('fa-circle-notch', 'fa-spin')
          this.#iconElm.classList.add(this.#icon)
        }
        break
    }
  }
}

customElements.define(TAG_NAME, WantedButton)

export default WantedButton
