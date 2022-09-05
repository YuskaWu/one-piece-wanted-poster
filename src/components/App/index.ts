import cssContent from './style.css?inline'
import SideMenu from '../SideMenu'
import WantedPoster, { WantedPosterAttribute } from '../WantedPoster'
import store, { addListener, removeListener, reset } from '../../store'

const template = document.createElement('template')
template.innerHTML = `
  <input id="uploadInput" type="file" accept="image/*">
  <slot name="poster"></slot>
  <div class="blood-overlay"></div>

  <github-corner
    class="github-corner"
    background-color="#584034"
    duration="1s"
    size="5rem"
    href="https://github.com/YuskaWu/one-piece-wanted-poster"
    title="GitHub page">
  </github-corner>

  <div class="button-container">
    <wanted-button
      id="configButton"
      icon="fa-cog"
      title="Open the edit panel.">
      EDIT
    </wanted-button>

    <wanted-button
      id="uploadButton"
      icon="fa-upload"
      title="Import local image to edit.">
      IMPORT
    </wanted-button>

    <wanted-button
      id="downloadButton"
      icon="fa-download"
      title="Export as image file.">
      EXPORT
    </wanted-button>

    <button id="criminalButton" class="criminal" aria-label="Criminal mode button" title="War criminal"></button>
  </div>

  <slot name="sideMenu"></slot>

  <div class="loading-overlay">
    <img class="loading-overlay__luffy" src="./images/luffy.png" alt="luffy logo"/>
  </div>
`

const TAG_NAME = 'app-container'
declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: App
  }
}

const WARCRIMINAL_HASH = '#warcriminal'
const WARCRIMINAL_POSTER_INFO = {
  padding: 10,
  name: 'PUTLER',
  bounty: `War Criminal`,
  avatarUrl: './images/war-criminal.png'
}

class App extends HTMLElement {
  #sideMenu: SideMenu
  #wantedPoster: WantedPoster
  #uploadInput: HTMLInputElement
  #configButton: HTMLButtonElement
  #uploadButton: HTMLButtonElement
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

    const sideMenuSlot = this.#root.querySelector<HTMLSlotElement>(
      'slot[name=sideMenu]'
    )
    this.#sideMenu = sideMenuSlot?.assignedNodes()[0] as SideMenu

    this.#uploadInput =
      this.#root.querySelector<HTMLInputElement>('#uploadInput')!
    this.#configButton =
      this.#root.querySelector<HTMLButtonElement>('#configButton')!
    this.#uploadButton =
      this.#root.querySelector<HTMLButtonElement>('#uploadButton')!
    this.#downloadButton =
      this.#root.querySelector<HTMLButtonElement>('#downloadButton')!
    this.#criminalButton =
      this.#root.querySelector<HTMLButtonElement>('#criminalButton')!

    this.#hashChangeListener = this.#onHashtagChange.bind(this)

    this.#storeListener = (key, value) => {
      switch (key) {
        case 'avatarUrl':
          this.#setWantedPosterAttributes({ 'avatar-url': value.toString() })
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

      setTimeout(() => loadingOverlay.remove(), 1000)
      setTimeout(
        () => this.#criminalButton.classList.add('criminal--visible'),
        3000
      )
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
      reset()
      Object.assign(store, { ...WARCRIMINAL_POSTER_INFO })
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

    this.#setWantedPosterAttributes({
      padding: store.padding.toString(),
      filter: store.filter
    })

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

    this.#configButton.addEventListener('click', () => {
      this.#sideMenu.toggle(true)
    })

    this.#uploadButton.addEventListener('click', () => {
      this.#uploadInput.value = ''
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

customElements.define(TAG_NAME, App)

export default App
