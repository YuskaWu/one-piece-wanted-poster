import cssContent from './style.css?inline'

const template = document.createElement('template')
template.innerHTML = `
<main id="app">
  <slot>
  </slot>
</main>
`
declare global {
  interface HTMLElementTagNameMap {
    'app-container': App
  }
}

class App extends HTMLElement {
  constructor() {
    super()
    // Create a shadow root
    const shadow = this.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    style.textContent = cssContent

    // attach the created elements to the shadow DOM
    shadow.append(style, template.content.cloneNode(true))
    shadow.addEventListener('WantedPosterLoaded', () => {
      console.log('ready!')
    })
  }

  connectedCallback() {
    console.log('[connected]')
  }

  disconnectedCallback() {
    console.log('[disconnected]')
  }

  adoptedCallback() {
    console.log('[adopted]')
  }

  // attributeChangedCallback(_: string, _: string, newValue: string) {}
}

customElements.define('app-container', App)

export default App
