interface FilterState {
  blur: number
  brightness: number
  contrast: number
  grayscale: number
  hueRotate: number
  saturate: number
  sepia: number
}

interface AppState extends FilterState {
  avatarUrl: string
  name: string
  bounty: string | number
  filter: string
  padding: number
}

type AppStateKey = keyof AppState

type Listener<T extends AppStateKey> = (
  key: T,
  value: AppState[T],
  store: AppState
) => void

const LISTENERS: Map<AppStateKey, Array<Listener<any>>> = new Map()

const DEFAULT_STATE: AppState = {
  avatarUrl: '',
  name: '',
  bounty: '',
  filter: '',
  padding: 0,
  blur: 0,
  brightness: 100,
  contrast: 105,
  grayscale: 35,
  hueRotate: 0,
  saturate: 80,
  sepia: 40
}

function getFilter({
  blur,
  brightness,
  contrast,
  grayscale,
  hueRotate,
  saturate,
  sepia
}: FilterState) {
  return `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) hue-rotate(${hueRotate}deg) saturate(${saturate}%) sepia(${sepia}%)`
}

const store = new Proxy<AppState>(
  { ...DEFAULT_STATE, filter: getFilter(DEFAULT_STATE) },
  {
    set: function (target, prop, value, receiver) {
      if (prop in DEFAULT_STATE === false) {
        return false
      }
      if (prop === 'filter') {
        return false
      }

      switch (prop) {
        case 'blur':
        case 'brightness':
        case 'contrast':
        case 'grayscale':
        case 'hueRotate':
        case 'saturate':
        case 'sepia':
          const filter = getFilter(target)
          target.filter = filter
          setTimeout(() => {
            const filterListeners = LISTENERS.get('filter')
            if (filterListeners) {
              filterListeners.forEach((listener) =>
                listener('filter', value, target)
              )
            }
          })
      }

      setTimeout(() => {
        const listeners = LISTENERS.get(prop as AppStateKey)
        if (listeners) {
          listeners.forEach((listener) => listener(prop, value, target))
        }
      })

      return Reflect.set(target, prop, value, receiver)
    }
  }
)

export function addListener<T extends keyof AppState>(
  key: T,
  listener: Listener<T>
) {
  let listeners = LISTENERS.get(key)
  if (!listeners) {
    listeners = []
  }
  listeners.push(listener)
  LISTENERS.set(key, listeners)
}

export function removeListener<T extends keyof AppState>(
  key: T,
  listener: Listener<T>
) {
  let listeners = LISTENERS.get(key)
  if (!listeners) {
    return
  }
  const index = listeners.findIndex((l) => l === listener)
  if (index > -1) {
    listeners.splice(index, 1)
  }
}

export default store
