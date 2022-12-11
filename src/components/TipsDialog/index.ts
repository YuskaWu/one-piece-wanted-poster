import cssContent from './style.css?inline'
import templateContent from './template.html?raw'

const TAG_NAME = 'tips-dialog'

const template = document.createElement('template')
template.innerHTML = templateContent

class TipsDialog extends HTMLElement {
  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = cssContent

    shadowRoot.append(style, template.content.cloneNode(true))
  }

  toggle() {
    if (this.hasAttribute('open')) {
      this.removeAttribute('open')
    } else {
      this.setAttribute('open', '')
    }
  }
}

customElements.define(TAG_NAME, TipsDialog)

export default TipsDialog
