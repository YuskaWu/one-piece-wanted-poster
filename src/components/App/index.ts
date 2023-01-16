import store, { addListener, removeListener, reset } from '../../store'
import EditPanel from '../EditPanel'
import type TipsDialog from '../TipsDialog'
import type WantedButton from '../WantedButton'
import WantedPoster, { WantedPosterAttribute } from '../WantedPoster'
import { WARCRIMINAL_POSTER } from './config'
import cssContent from './style.css?inline'
import templateContent from './template.html?raw'

const TAG_NAME = 'app-container'

const WARCRIMINAL_HASH = '#warcriminal'

const template = document.createElement('template')
template.innerHTML = templateContent

class App extends HTMLElement {
  #editPanel: EditPanel
  #tipsDialog: TipsDialog
  #wantedPoster: WantedPoster
  #uploadInput: HTMLInputElement
  #editButton: WantedButton
  #importButton: WantedButton
  #exportButton: WantedButton
  #criminalButton: HTMLButtonElement
  #tipsButton: HTMLButtonElement

  #carouselIntervalId: number = 0

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

    const editPanelSlot = this.#root.querySelector<HTMLSlotElement>(
      'slot[name=editPanel]'
    )
    this.#editPanel = editPanelSlot?.assignedNodes()[0] as EditPanel
    this.#tipsDialog = this.#root.querySelector<TipsDialog>('tips-dialog')!

    this.#uploadInput =
      this.#root.querySelector<HTMLInputElement>('#uploadInput')!
    this.#editButton = this.#root.querySelector<WantedButton>('#editButton')!
    this.#importButton =
      this.#root.querySelector<WantedButton>('#importButton')!
    this.#exportButton =
      this.#root.querySelector<WantedButton>('#exportButton')!
    this.#criminalButton =
      this.#root.querySelector<HTMLButtonElement>('#criminalButton')!
    this.#tipsButton =
      this.#root.querySelector<HTMLButtonElement>('#tipsButton')!

    this.#hashChangeListener = this.#onHashtagChange.bind(this)

    this.#storeListener = (key, value) => {
      switch (key) {
        case 'avatarUrl':
          this.#setWantedPosterAttributes({ 'avatar-url': value.toString() })
          break
        case 'nameSpacing':
          this.#setWantedPosterAttributes({
            'name-spacing': value.toString()
          })
          break
        case 'bountySpacing':
          this.#setWantedPosterAttributes({
            'bounty-spacing': value.toString()
          })
          break
        case 'name':
        case 'bounty':
        case 'shadow':
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

      if (location.hash === WARCRIMINAL_HASH) {
        this.#criminalButton.classList.add('criminal--visible')
        return
      }

      setTimeout(
        () => this.#criminalButton.classList.add('criminal--visible'),
        10000
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
    this.#tipsButton.classList.toggle('tips-button--hidden')
    this.#root
      .querySelector<HTMLDivElement>('.button-container')
      ?.classList.toggle('button-container--hidden')

    if (toggle) {
      reset({ ...WARCRIMINAL_POSTER })
    }

    this.#toggleWarCriminalCarousel(toggle)
  }

  #toggleWarCriminalCarousel(toggle: boolean) {
    if (!toggle) {
      clearInterval(this.#carouselIntervalId)
      return
    }

    reset({ avatarUrl: WARCRIMINAL_POSTER.avatarUrls[0] })

    let index = 1
    this.#carouselIntervalId = window.setInterval(() => {
      reset({ avatarUrl: WARCRIMINAL_POSTER.avatarUrls[index] })
      index = (index + 1) % WARCRIMINAL_POSTER.avatarUrls.length
    }, 5000)
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
      'name-spacing': store.nameSpacing.toString(),
      'bounty-spacing': store.bountySpacing.toString(),
      shadow: store.shadow.toString(),
      filter: store.filter
    })

    addListener('avatarUrl', this.#storeListener)
    addListener('name', this.#storeListener)
    addListener('bounty', this.#storeListener)
    addListener('nameSpacing', this.#storeListener)
    addListener('bountySpacing', this.#storeListener)
    addListener('shadow', this.#storeListener)
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

    this.addEventListener('dragleave', (e) => {
      // The "dragleave" event will trigger whenever cursor cross over the child element
      // which is a web component, so we can not just remove "dragin" style without any judgement.

      // For dragleave event, the "relatedTarget" property menas the element entered to.
      // So if "relatedTarget" is null, it will be the outside of window, which is the case
      // that we want to remove "dragin" style.
      if (e.relatedTarget === null) {
        this.classList.remove('dragin')
      }
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
      store.avatarUrl = objUrl
    })

    this.#uploadInput.addEventListener('input', () => {
      const file = this.#uploadInput.files ? this.#uploadInput.files[0] : null
      if (!file || !file.type.startsWith('image')) {
        return
      }

      const objUrl = URL.createObjectURL(file)
      store.avatarUrl = objUrl
    })

    this.#editButton.addEventListener('click', () => {
      this.#editPanel.toggle(true)
    })

    this.#importButton.addEventListener('click', () => {
      this.#uploadInput.value = ''
      this.#uploadInput.click()
    })

    this.#exportButton.addEventListener('click', async () => {
      if (this.#exportButton.loading) {
        return
      }
      this.#exportButton.loading = true
      await this.#wantedPoster.export()
      this.#exportButton.loading = false
    })

    this.#criminalButton.addEventListener('click', () => {
      const isEnabled = location.hash === WARCRIMINAL_HASH
      location.hash = isEnabled ? '' : WARCRIMINAL_HASH
    })

    this.#tipsButton.addEventListener('click', () => {
      this.#tipsDialog.toggle()
    })
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this.#hashChangeListener)
    removeListener('avatarUrl', this.#storeListener)
    removeListener('name', this.#storeListener)
    removeListener('bounty', this.#storeListener)
    removeListener('shadow', this.#storeListener)
    removeListener('filter', this.#storeListener)
  }
}

customElements.define(TAG_NAME, App)

export default App
