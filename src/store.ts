interface FilterState {
  blur: number
  brightness: number
  contrast: number
  grayscale: number
  hueRotate: number
  saturate: number
  sepia: number
}

export interface AppState extends FilterState {
  photoUrl: string
  name: string
  bounty: string | number
  filter: string
  posterShadow: number
  photoShadow: number
  nameSpacing: number
  bountySpacing: number
  bountyFontFamily: string
  bountyFontScale: number
  bountyFontWeight: number
  bountyVerticalOffset: number
}

type AppStateKey = keyof AppState

type Listener<T extends AppStateKey> = (
  key: T,
  value: AppState[T],
  store: AppState
) => void

const LISTENERS: Map<AppStateKey, Array<Listener<AppStateKey>>> = new Map()

const DEFAULT_STATE: AppState = {
  photoUrl: '',
  name: '',
  bounty: '',
  nameSpacing: 0,
  bountySpacing: 1,
  bountyFontFamily: 'Vertiky',
  bountyFontScale: 1,
  bountyFontWeight: 600,
  bountyVerticalOffset: -4,
  filter: '',
  posterShadow: 0,
  photoShadow: 0,
  blur: 0,
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  hueRotate: 0,
  saturate: 100,
  sepia: 0
}

function assertIsAppStateKey(key: string | symbol): key is AppStateKey {
  return key in DEFAULT_STATE
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
    set(target, prop, value, receiver) {
      if (!assertIsAppStateKey(prop)) {
        // ignroe unknown property
        return true
      }

      switch (prop) {
        case 'blur':
        case 'brightness':
        case 'contrast':
        case 'grayscale':
        case 'hueRotate':
        case 'saturate':
        case 'sepia': {
          const filterValue = getFilter({ ...target, [prop]: value })
          if (filterValue === target.filter) {
            break
          }
          target.filter = filterValue
          setTimeout(() => {
            const filterListeners = LISTENERS.get('filter') ?? []
            filterListeners.forEach((listener) =>
              listener('filter', filterValue, target)
            )
          })
        }
      }

      setTimeout(() => {
        const listeners = LISTENERS.get(prop) ?? []
        listeners.forEach((listener) => listener(prop, value, target))
      })

      return Reflect.set(target, prop, value, receiver)
    }
  }
)

export function addListener(key: AppStateKey, listener: Listener<AppStateKey>) {
  let listeners = LISTENERS.get(key)
  if (!listeners) {
    listeners = []
    LISTENERS.set(key, listeners)
  }
  listeners.push(listener)
}

export function removeListener<T extends AppStateKey>(
  key: T,
  listener: Listener<T>
) {
  const listeners = LISTENERS.get(key)
  if (!listeners) {
    return
  }
  const index = listeners.findIndex((l) => l === listener)
  if (index > -1) {
    listeners.splice(index, 1)
  }
}

export function update(state: Partial<AppState> = {}) {
  Object.assign(store, {
    ...store,
    filter: getFilter(DEFAULT_STATE),
    ...state
  })
}

export function reset(state: Partial<AppState> = {}) {
  Object.assign(store, { ...DEFAULT_STATE, ...state })
}

export default store
