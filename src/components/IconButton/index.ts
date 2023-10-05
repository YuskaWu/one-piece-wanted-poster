import { IconifyIconAttributes, IconifyIconHTMLElement } from 'iconify-icon'
import ButtonImageUrl from './circle-button.png'
import cssContent from './style.css?inline'
import templateContent from './template.html?raw'

type Attributes = keyof IconifyIconAttributes
export type IconButtonAttribute = IconifyIconAttributes

const TAG_NAME = 'icon-button'
const ATTRIBUTES: Attributes[] = [
  'icon',
  'mode',
  'flip',
  'height',
  'width',
  'inline',
  'preserveAspectRatio',
  'rotate'
]

const template = document.createElement('template')
template.innerHTML = templateContent

class IconButton extends HTMLElement {
  #iconifyIcon: IconifyIconHTMLElement

  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = cssContent

    shadowRoot.append(style, template.content.cloneNode(true))

    shadowRoot.querySelector('img')?.setAttribute('src', ButtonImageUrl)
    this.#iconifyIcon = shadowRoot.querySelector(
      'iconify-icon'
    ) as IconifyIconHTMLElement
  }

  static get observedAttributes(): Attributes[] {
    return ATTRIBUTES
  }

  connectedCallback() {
    this.style.backgroundImage = `url(${ButtonImageUrl})`
  }

  attributeChangedCallback(
    attributeName: Attributes,
    _: string,
    newValue: string
  ) {
    this.#iconifyIcon.setAttribute(attributeName, newValue)
  }
}

customElements.define(TAG_NAME, IconButton)

export default IconButton
