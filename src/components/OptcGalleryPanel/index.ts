import store from '../../store'
import type IconButton from '../IconButton'
import cssContent from './style.css?inline'
import templateContent from './template.html?raw'

type CharacterFamily = Record<string, string[]>
type Units = Array<[string, ...unknown[]]>

const TAG_NAME = 'optc-gallery-panel'

const template = document.createElement('template')
template.innerHTML = templateContent

class OptcGalleryPanel extends HTMLElement {
  #inputTimeoutId: number = 0
  #characterFamily: CharacterFamily | null = null
  #searchInput: HTMLInputElement
  #orderButton: IconButton
  #closeButton: IconButton
  #imageGrid: HTMLDivElement
  #pageNumberWrapper: HTMLDivElement
  #preButton: HTMLButtonElement
  #nextButton: HTMLButtonElement
  #error: HTMLDivElement

  #pointerdownListener: (e: PointerEvent) => void

  #order: 'ascending' | 'descending' = 'ascending'
  #pageSize = 10
  #currentPage = 1
  #totalPage = 0

  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = cssContent

    shadowRoot.append(style, template.content.cloneNode(true))

    this.#searchInput =
      shadowRoot.querySelector<HTMLInputElement>('#searchInput')!
    this.#orderButton = shadowRoot.querySelector<IconButton>('#orderButton')!
    this.#closeButton = shadowRoot.querySelector<IconButton>('#closeButton')!
    this.#imageGrid = shadowRoot.querySelector<HTMLDivElement>('#imageGrid')!
    this.#pageNumberWrapper =
      shadowRoot.querySelector<HTMLDivElement>('#pageNumberWrapper')!

    this.#preButton = shadowRoot.querySelector<HTMLButtonElement>('#preButton')!
    this.#nextButton =
      shadowRoot.querySelector<HTMLButtonElement>('#nextButton')!
    this.#error = shadowRoot.querySelector<HTMLDivElement>('#error')!

    this.#pointerdownListener = (e: PointerEvent) => {
      const isInside = e.composedPath().includes(this)
      if (isInside) {
        return
      }
      this.classList.contains('open') && this.toggle()
    }
  }

  async init() {
    this.setAttribute('loading', '')

    try {
      const [families, units] = await Promise.all([
        this.#fetchFamilies(),
        this.#fetchUnits()
      ])

      for (let index = units.length - 1; index > 0; index--) {
        const unitId = index + 1
        if (unitId in families) {
          continue
        }

        const unitName = units[index][0]
        families[unitId] = [unitName]
      }

      this.#characterFamily = families

      this.#render()
    } catch (e) {
      this.setAttribute('error', '')
      let message = 'Faild to get character info.'
      if (e instanceof Error) {
        message += '\n' + e.message
      }
      this.#error.innerText = message
    } finally {
      this.removeAttribute('loading')
    }
  }

  async #fetchFamilies() {
    const response = await fetch(
      'https://raw.githubusercontent.com/optc-db/optc-db.github.io/master/common/data/families.js'
    )

    let text = await response.text()

    text = text
      .replace('(function () {', '')
      .replace('window.families =', 'const families = ')
      .replace('const calcGhostStartIDStart = 5000;', '')
      .replace(/const ghostFamilies(.|\n)*\}\);/, '')
      .replace('})();', 'export default families')

    const blob = new Blob([text], { type: 'text/javascript' })
    const familiesModuleUrl = URL.createObjectURL(blob)

    const { default: families } = (await import(
      /* @vite-ignore */ familiesModuleUrl
    )) as {
      default: CharacterFamily
    }

    return families
  }

  async #fetchUnits() {
    const response = await fetch(
      'https://raw.githubusercontent.com/optc-db/optc-db.github.io/master/common/data/units.js'
    )

    let text = await response.text()

    text = text
      .replace('window.units =', 'const units = ')
      .replace('for(var i = 0; window.units.length', 'for(var i = 0; Infinity')
      .replace('window.units.push', 'units.push')
      .replace('window.units = window.units.concat(globalExUnits);', '')
      .replace(
        'window.units = window.units.concat(ghostsUnits);',
        'export default units'
      )
      .replaceAll('var ', 'let ')

    const blob = new Blob([text], { type: 'text/javascript' })
    const unitsModuleUrl = URL.createObjectURL(blob)

    const { default: units } = (await import(
      /* @vite-ignore */ unitsModuleUrl
    )) as {
      default: Units
    }

    return units
  }

  get ids() {
    if (!this.#characterFamily) {
      return []
    }

    const keyword = this.#searchInput.value.toLowerCase().trim()

    if (!keyword) {
      return Array.from(Object.keys(this.#characterFamily))
    }

    const matchedId = []
    for (const id in this.#characterFamily) {
      if (id.includes(keyword)) {
        matchedId.push(id)
        continue
      }

      const names = this.#characterFamily[id]
      const isMatched = names.some((name) =>
        name.toLocaleLowerCase().includes(keyword)
      )
      if (isMatched) {
        matchedId.push(id)
      }
    }

    return matchedId
  }

  #onInput() {
    clearTimeout(this.#inputTimeoutId)
    this.#inputTimeoutId = setTimeout(() => {
      this.#currentPage = 1
      this.#render()
    }, 500)
  }

  #renderPagination() {
    this.#pageNumberWrapper.innerHTML = ''

    if (this.#totalPage === 0) {
      this.#preButton.disabled = true
      this.#nextButton.disabled = true
      return
    }

    let offset = 1
    const pageNumberSet = new Set<number>([
      1,
      this.#totalPage,
      this.#currentPage
    ])

    const max = Math.min(this.#totalPage, 5)
    while (pageNumberSet.size < max) {
      const offsetBefore = Math.max(this.#currentPage - offset, 1)
      const offsetAfter = Math.min(this.#currentPage + offset, this.#totalPage)
      pageNumberSet.add(offsetBefore)
      pageNumberSet.add(offsetAfter)
      offset++
    }

    const numbers = Array.from(pageNumberSet.values()).sort((a, b) => a - b)
    numbers.forEach((n, index) => {
      const buttonElm = document.createElement('button')
      buttonElm.innerText = n.toString()
      buttonElm.classList.add('page-button')
      buttonElm.addEventListener('click', () => {
        this.#currentPage = n
        this.#render()
      })
      if (this.#currentPage === n) {
        buttonElm.classList.add('page-button--active')
        buttonElm.toggleAttribute('disabled')
      }
      this.#pageNumberWrapper.appendChild(buttonElm)

      const nextIndex = index + 1
      if (nextIndex < numbers.length && numbers[nextIndex] - n > 1) {
        const buttonElm = document.createElement('button')
        buttonElm.classList.add('page-button')
        buttonElm.toggleAttribute('disabled')
        buttonElm.innerText = '...'
        this.#pageNumberWrapper.appendChild(buttonElm)
      }
    })

    this.#preButton.toggleAttribute('disabled', this.#currentPage === 1)
    this.#nextButton.toggleAttribute(
      'disabled',
      this.#currentPage === this.#totalPage
    )
  }

  #render() {
    this.#imageGrid.innerHTML = ''
    const ids = this.ids
    this.#totalPage = Math.ceil(ids.length / this.#pageSize)

    this.#renderPagination()

    if (this.#totalPage === 0) {
      return
    }

    const startIndex = (this.#currentPage - 1) * this.#pageSize
    const currentPageIds =
      this.#order === 'ascending'
        ? ids.slice(startIndex, startIndex + this.#pageSize)
        : ids.reverse().slice(startIndex, startIndex + this.#pageSize)

    currentPageIds.forEach((id) => {
      const idNumber = parseInt(id)
      if (isNaN(idNumber)) {
        return
      }

      const groupNumber = Math.floor(idNumber / 1000)
      const subGroupNumber = (Math.floor((idNumber % 1000) / 100) * 100)
        .toString()
        .padStart(3, '0')
      const fileName = idNumber.toString().padStart(4, '0') + '.png'
      const url = `https://optc-db.github.io/api/images/full/transparent/${groupNumber}/${subGroupNumber}/${fileName}`
      const names = this.#characterFamily
        ? this.#characterFamily[id].join(', ').toUpperCase()
        : ''
      const img = new Image()
      img.src = url
      img.loading = 'lazy'
      img.dataset['id'] = id
      img.dataset['name'] = names
      this.#imageGrid.appendChild(img)
    })
  }

  toggle() {
    if (!this.#characterFamily && !this.classList.contains('open')) {
      this.init()
    }
    this.classList.toggle('open')
  }

  connectedCallback() {
    window.addEventListener('pointerdown', this.#pointerdownListener)

    this.#searchInput.addEventListener('input', () => this.#onInput())
    this.#orderButton.addEventListener('click', () => {
      this.#order = this.#order === 'ascending' ? 'descending' : 'ascending'
      this.#orderButton.toggleAttribute('descending')
      this.#render()
    })
    this.#closeButton.addEventListener('click', () => this.toggle())
    this.#imageGrid.addEventListener('click', (e) => {
      const target = e.target
      if (target instanceof Image) {
        store.photoUrl = target.src
        store.name = target.dataset['name'] ?? ''
        this.toggle()
      }
    })
    this.#preButton.addEventListener('click', () => {
      if (this.#currentPage === 1) {
        return
      }
      this.#currentPage--
      this.#render()
    })
    this.#nextButton.addEventListener('click', () => {
      if (this.#currentPage === this.#totalPage) {
        return
      }
      this.#currentPage++
      this.#render()
    })
  }

  disconnectedCallback() {
    window.removeEventListener('pointerdown', this.#pointerdownListener)
  }
}

customElements.define(TAG_NAME, OptcGalleryPanel)

export default OptcGalleryPanel
