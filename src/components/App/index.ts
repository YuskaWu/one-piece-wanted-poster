import cssContent from './style.css?inline'
import WantedPoster, { WantedPosterAttribute } from '../WantedPoster'
import { addListener, removeListener } from '../../store'

const template = document.createElement('template')
template.innerHTML = `
  <input id="uploadInput" type="file" >
  <slot name="poster"></slot>
  <div class="blood-overlay"></div>

  <div class="button-container">
    <wanted-button
      id="configButton"
      icon="fa-cog">
      CONFIG
    </wanted-button>

    <wanted-button
      id="uploadButton"
      icon="fa-upload">
      UPLOAD
    </wanted-button>

    <wanted-button
      id="downloadButton"
      icon="fa-download"
      font-size="0.5rem">
      DOWNLOAD
    </wanted-button>

    <button id="criminalButton" class="criminal"></button>
  </div>

  <slot></slot>

  <div class="loading-overlay">
    <img class="loading-overlay__luffy" src="./images/luffy.png"/>
  </div>
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
  bounty: `War Criminal`,
  'avatar-url': './images/war-criminal.png'
}

class App extends HTMLElement {
  #wantedPoster: WantedPoster
  #uploadInput: HTMLInputElement
  #uploadBbtton: HTMLButtonElement
  #downloadButton: HTMLButtonElement
  #criminalButton: HTMLButtonElement
  #startTime: number = 0
  #root: ShadowRoot
  #hashChangeListener: (event: HashChangeEvent) => void
  #storeListener: Parameters<typeof addListener>[1]

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

    const posterSlot =
      this.#root.querySelector<HTMLSlotElement>('slot[name=poster]')
    this.#wantedPoster = posterSlot?.assignedNodes()[0] as WantedPoster

    this.#uploadInput =
      this.#root.querySelector<HTMLInputElement>('#uploadInput')!
    this.#uploadBbtton =
      this.#root.querySelector<HTMLButtonElement>('#uploadButton')!
    this.#downloadButton =
      this.#root.querySelector<HTMLButtonElement>('#downloadButton')!
    this.#criminalButton =
      this.#root.querySelector<HTMLButtonElement>('#criminalButton')!

    this.#hashChangeListener = this.#onHashtagChange.bind(this)

    this.#storeListener = (key, value) => {
      switch (key) {
        case 'avatarUrl':
        case 'name':
        case 'bounty':
        case 'padding':
        case 'filter':
          this.#setWantedPosterAttributes({ [key]: value.toString() })
      }
    }
    window.addEventListener('hashchange', this.#hashChangeListener)
  }

  #removeLoading() {
    const loadingOverlay =
      this.#root.querySelector<HTMLElement>('.loading-overlay')!

    let minLoadingTime = 1000
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
    const overlay = this.#root.querySelector<HTMLElement>('.blood-overlay')
    if (!overlay) {
      return
    }

    this.classList.toggle('warcriminal')
    overlay.classList.toggle('blood-overlay--visible')
    this.#criminalButton.classList.toggle('criminal--stamp')

    if (toggle) {
      this.#setWantedPosterAttributes(WARCRIMINAL_POSTER_INFO)
    }
  }

  #setWantedPosterAttributes(attributes: WantedPosterAttribute) {
    const keys = Object.keys(attributes) as Array<keyof WantedPosterAttribute>
    for (let key of keys) {
      const value = attributes[key] ?? ''
      this.#wantedPoster.setAttribute(key, value)
    }
  }

  connectedCallback() {
    this.#startTime = new Date().getTime()

    addListener('avatarUrl', this.#storeListener)
    addListener('name', this.#storeListener)
    addListener('bounty', this.#storeListener)
    addListener('padding', this.#storeListener)
    addListener('filter', this.#storeListener)

    if (location.hash === WARCRIMINAL_HASH) {
      this.#toggleWarCriminalMode(true)
    }

    this.addEventListener('dragover', (event) => {
      // prevent default to allow drop
      event.preventDefault()
    })

    this.addEventListener('dragenter', () => {
      this.classList.add('dragin')
    })

    this.addEventListener('dragleave', () => {
      this.classList.remove('dragin')
    })

    this.addEventListener('drop', (event) => {
      // prevent default action (open as link for some elements)
      event.preventDefault()
      this.classList.remove('dragin')

      const file = event.dataTransfer?.files[0]
      if (!file || !file.type.startsWith('image')) {
        return
      }

      const objUrl = URL.createObjectURL(file)
      this.#setWantedPosterAttributes({ 'avatar-url': objUrl })
    })

    this.#uploadInput.addEventListener('change', () => {
      const file = this.#uploadInput.files ? this.#uploadInput.files[0] : null
      if (!file || !file.type.startsWith('image')) {
        return
      }

      const objUrl = URL.createObjectURL(file)
      this.#setWantedPosterAttributes({ 'avatar-url': objUrl })
    })

    this.#uploadBbtton.addEventListener('click', () => {
      this.#uploadInput.click()
    })

    this.#downloadButton.addEventListener('click', async () => {
      this.#downloadButton.setAttribute('loading', 'true')
      await this.#wantedPoster.export()
      this.#downloadButton.removeAttribute('loading')
    })

    this.#criminalButton.addEventListener('click', () => {
      const isEnabled = location.hash === WARCRIMINAL_HASH
      location.hash = isEnabled ? '' : WARCRIMINAL_HASH
    })
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this.#hashChangeListener)
    removeListener('avatarUrl', this.#storeListener)
    removeListener('name', this.#storeListener)
    removeListener('bounty', this.#storeListener)
    removeListener('padding', this.#storeListener)
    removeListener('filter', this.#storeListener)
  }
}

customElements.define('app-container', App)

export default App
