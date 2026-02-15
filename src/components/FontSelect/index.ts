import IconButton from '../IconButton'
import cssContent from './style.css?inline'
import templateContent from './template.html?raw'

declare global {
  interface FontData {
    family: string
    fullName: string
    postscriptName: string
    style: string
    blob: () => Promise<Blob>
  }

  interface Window {
    queryLocalFonts?: () => Promise<FontData[]>
  }
}

type Attributes = typeof ATTRIBUTES

const TAG_NAME = 'font-select'
const ATTRIBUTES = ['value'] as const

const template = document.createElement('template')
template.innerHTML = templateContent

class FontSelect extends HTMLElement {
  #select: HTMLSelectElement
  #addButton: IconButton
  #fileInput: HTMLInputElement
  #fontFamilies: Set<string> = new Set()
  #tmpValue: string | null = null
  #isLocalFontAdded = false

  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = cssContent

    shadowRoot.append(style, template.content.cloneNode(true))

    this.#select = shadowRoot.querySelector('select') as HTMLSelectElement
    this.#select.addEventListener('input', () => {
      this.#select.style.fontFamily = this.#select.value
    })
    this.#select.addEventListener('click', () => {
      this.#renderLocalFontOptions()
    })

    this.#addButton = shadowRoot.querySelector<IconButton>('icon-button')!
    this.#fileInput = shadowRoot.querySelector<HTMLInputElement>('#file-input')!

    this.#addButton.addEventListener('click', () => {
      this.#fileInput.click()
    })

    this.#fileInput.addEventListener('input', async (e) => {
      e.stopImmediatePropagation()
      const file = this.#fileInput.files ? this.#fileInput.files[0] : null
      if (!file) {
        return
      }

      const objUrl = URL.createObjectURL(file)
      const fontName = file.name.split('.')[0]
      const fontFace = new FontFace(fontName, `url(${objUrl})`)

      try {
        await fontFace.load()
        document.fonts.add(fontFace)
        this.#addFontFamily(fontName)
        this.value = fontName
        this.dispatchEvent(new CustomEvent('input'))
      } catch {
        // TODO show message toast
      }
    })

    const fontSet = new Set<string>()
    Array.from(document.fonts).forEach((f) => fontSet.add(f.family))
    this.#addFontFamilies(fontSet)

    document.fonts.addEventListener('loadingdone', () => {
      document.fonts.forEach((f) => {
        if (this.#fontFamilies.has(f.family)) {
          return
        }
        this.#addFontFamily(f.family)
        if (f.family === this.#tmpValue) {
          this.value = this.#tmpValue
          this.#tmpValue = null
        }
      })
    })
  }

  async #renderLocalFontOptions() {
    if (!window.queryLocalFonts || this.#isLocalFontAdded) {
      return
    }
    try {
      const availableFonts = await window.queryLocalFonts()
      const fontSet = new Set<string>()
      for (const fontData of availableFonts) {
        fontSet.add(fontData.family)
      }

      await this.#addFontFamilies(fontSet)
      this.#isLocalFontAdded = true
    } catch (e) {
      // TODO show message toast
      console.error(e)
    }
  }

  #addFontFamily(fontFamily: string) {
    this.#fontFamilies.add(fontFamily)
    const option = this.#createOption(fontFamily)
    this.#select.appendChild(option)
  }

  async #addFontFamilies(fontSet: Set<string>) {
    const fonts = Array.from(fontSet)

    const pageSize = 5
    const totalPages = Math.ceil(fonts.length / pageSize)

    for (let page = 0; page < totalPages; page++) {
      const fragment = new DocumentFragment()
      const start = page * pageSize
      const end = Math.min((page + 1) * pageSize, fonts.length)

      for (let index = start; index < end; index++) {
        const font = fonts[index]
        if (this.#fontFamilies.has(font)) {
          continue
        }
        this.#fontFamilies.add(font)
        const option = this.#createOption(font)
        fragment.appendChild(option)
      }

      this.#select.appendChild(fragment)

      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 20)
      })
    }
  }

  #createOption(fontFamily: string) {
    const option = document.createElement('option')
    option.value = fontFamily
    option.innerText = fontFamily
    option.style.fontFamily = fontFamily
    return option
  }

  get value() {
    return this.#select.value
  }

  set value(v: string) {
    this.#select.style.fontFamily = v
    this.#select.value = v
    this.#tmpValue = this.#fontFamilies.has(v) ? null : v
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
      case 'value':
        this.value = newValue
        break
    }
  }
}

customElements.define(TAG_NAME, FontSelect)

export default FontSelect
