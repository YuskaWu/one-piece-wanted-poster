import cssContent from './style.css?inline'
import templateContent from './template.html?raw'

const TAG_NAME = 'luffy-logo'

const template = document.createElement('template')
template.innerHTML = templateContent

class LuffyLogo extends HTMLElement {
  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = cssContent

    shadowRoot.append(style, template.content.cloneNode(true))
  }
}

customElements.define(TAG_NAME, LuffyLogo)

export default LuffyLogo
