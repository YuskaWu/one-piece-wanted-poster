import cssContent from './style.css?inline'

const TAG_NAME = 'github-corner'

declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: GithubCorner
  }
}

const ATTRIBUTES = [
  'size',
  'href',
  'placement',
  'background-color',
  'octopus-color',
  'duration'
] as const

type Attributes = typeof ATTRIBUTES

const template = document.createElement('template')
template.innerHTML = `
<a class="link" aria-label="View source on GitHub" target="_blank">
  <svg class="octo" viewBox="0 0 250 250" aria-hidden="true">
    <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
    <path
      d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
      fill="currentColor" style="transform-origin: 130px 106px;" class="octo__arm"></path>
    <path
      d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
      fill="currentColor" class="octo__body"></path>
  </svg>
</a>
`
const PLACEMENT = ['topRight', 'topLeft']

const DEFAULT_SIZE = '5rem'
const DEFAULT_BG_COLOR = 'black'
const DEFAULT_OCTOPUS_COLOR = 'white'
const DEFAULT_DURATION = '0.5s'

class GithubCorner extends HTMLElement {
  #anchor: HTMLAnchorElement
  #svg: SVGElement
  #octoArm: SVGPathElement

  constructor() {
    super()

    // Create a shadow root
    const shadowRoot = this.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    style.textContent = cssContent

    // attach the created elements to the shadow DOM
    shadowRoot.append(style, template.content.cloneNode(true))

    this.#anchor = shadowRoot.querySelector('a.link') as HTMLAnchorElement
    this.#svg = shadowRoot.querySelector('svg.octo') as SVGElement
    this.#octoArm = shadowRoot.querySelector('path.octo__arm') as SVGPathElement

    this.style.width = DEFAULT_SIZE
    this.style.height = DEFAULT_SIZE

    this.#svg.style.fill = DEFAULT_BG_COLOR
    this.#svg.style.color = DEFAULT_OCTOPUS_COLOR
    this.#octoArm.style.color = DEFAULT_OCTOPUS_COLOR

    this.#octoArm.style.animationDuration = DEFAULT_DURATION

    this.setAttribute('placement', PLACEMENT[0])
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
      case 'size':
        this.style.width = newValue
        this.style.height = newValue
        break

      case 'href':
        this.#anchor.href = newValue
        break

      case 'background-color':
        this.#svg.style.fill = newValue
        break

      case 'octopus-color':
        console.log('octopusColor', newValue)
        this.#svg.style.color = newValue
        this.#octoArm.style.color = newValue
        break

      case 'duration':
        this.#octoArm.style.animationDuration = newValue
        break

      case 'placement':
        if (PLACEMENT.includes(newValue)) {
          this.setAttribute('placement', newValue)
        }
    }
  }
}

customElements.define(TAG_NAME, GithubCorner)

export default GithubCorner
