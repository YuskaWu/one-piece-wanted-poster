import WantedPoster, { WantedPosterAttribute } from '../WantedPoster'
import cssContent from './style.css?inline'

const template = document.createElement('template')
template.innerHTML = `
<main class="app">
  <slot name="poster"></slot>
  <div class="blood-overlay"></div>

  <slot></slot>

  <button id="upload" class="img-button img-button--upload"></button>
  <button id="download" class="img-button img-button--download"></button>
  <button id="blood-hand" class="img-button img-button--blood-hand"></button>

  <div class="loading-overlay">
    <img class="loading-overlay__luffy" src="/images/luffy.png"/>
  </div>
</main>
`
declare global {
  interface HTMLElementTagNameMap {
    'app-container': App
  }
}

const WARCRIMINAL_HASH = '#warcriminal'
const WARCRIMINAL_POSTER_INFO: WantedPosterAttribute = {
  name: 'PUTLER',
  padding: '10',
  bounty: '??????????',
  'avatar-url': './images/war-criminal.png'
}

class App extends HTMLElement {
  #startTime: number = 0
  #root: ShadowRoot
  #hashChangeListener: (event: HashChangeEvent) => void

  constructor() {
    super()

    // Create a shadow root
    const shadowRoot = this.attachShadow({ mode: 'open' })
    this.#root = shadowRoot

    const style = document.createElement('style')
    style.textContent = cssContent

    // attach the created elements to the shadow DOM
    shadowRoot.append(style, template.content.cloneNode(true))
    shadowRoot.addEventListener('WantedPosterLoaded', () => {
      this.#removeLoading()
    })

    this.#hashChangeListener = this.#onHashtagChange.bind(this)
    window.addEventListener('hashchange', this.#hashChangeListener)
  }

  #removeLoading() {
    const loadingOverlay =
      this.#root.querySelector<HTMLElement>('.loading-overlay')!

    let minLoadingTime = 1
    let intervalId = setInterval(() => {
      const time = new Date().getTime()
      if (time - this.#startTime < minLoadingTime) {
        return
      }

      clearTimeout(intervalId)
      loadingOverlay.style.transition = 'opacity 1s'
      loadingOverlay.style.opacity = '0'
      setTimeout(() => {
        loadingOverlay.remove()
      }, 1000)
    }, 200)
  }

  #onHashtagChange() {
    this.#toggleWarCriminalMode(location.hash === WARCRIMINAL_HASH)
  }

  #toggleWarCriminalMode(toggle: boolean) {
    const container = this.#root.querySelector<HTMLElement>('.app')
    const overlay = this.#root.querySelector<HTMLElement>('.blood-overlay')

    if (!container || !overlay) {
      return
    }

    if (!toggle) {
      container.classList.remove('app--warcriminal')
      overlay.classList.remove('blood-overlay--visible')
      return
    }

    container.classList.add('app--warcriminal')
    overlay.classList.add('blood-overlay--visible')

    this.#setWantedPosterAttributes(WARCRIMINAL_POSTER_INFO)
  }

  #setWantedPosterAttributes(attributes: WantedPosterAttribute) {
    const slot = this.#root.querySelector<HTMLSlotElement>('slot[name=poster]')
    const wantedPoster = slot?.assignedNodes()[0] as WantedPoster
    const keys = Object.keys(attributes) as Array<keyof WantedPosterAttribute>
    for (let key of keys) {
      const value = attributes[key] ?? ''
      wantedPoster.setAttribute(key, value)
    }
  }

  connectedCallback() {
    this.#startTime = new Date().getTime()

    const main = this.#root.querySelector<HTMLElement>('main')!
    main.addEventListener('dragover', (event) => {
      // prevent default to allow drop
      event.preventDefault()
    })

    main.addEventListener('dragenter', () => {
      main.classList.add('app--dragin')
    })

    main.addEventListener('dragleave', () => {
      main.classList.remove('app--dragin')
    })

    main.addEventListener('drop', (event) => {
      // prevent default action (open as link for some elements)
      event.preventDefault()
      main.classList.remove('app--dragin')

      const file = event.dataTransfer?.files[0]
      if (!file || !file.type.startsWith('image')) {
        return
      }

      const objUrl = URL.createObjectURL(file)
      this.#setWantedPosterAttributes({ 'avatar-url': objUrl })
    })

    this.#root
      .querySelector<HTMLButtonElement>('button#blood-hand')
      ?.addEventListener('click', () => {
        location.href = WARCRIMINAL_HASH
      })
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this.#hashChangeListener)
  }

  adoptedCallback() {}
}

customElements.define('app-container', App)

export default App