import { AppState } from '../../store'

export const WARCRIMINAL_POSTER = {
  shadow: 5,
  blur: 0,
  brightness: 100,
  contrast: 100,
  hueRotate: 0,
  grayscale: 12,
  saturate: 80,
  sepia: 15,
  name: 'PUTLER',
  bounty: 'War Criminal',
  nameSpacing: 0,
  bountySpacing: 1,
  photoUrls: [
    './images/war-criminal/photo-01.png',
    './images/war-criminal/photo-02.png',
    './images/war-criminal/photo-03.png'
  ]
} satisfies Partial<AppState> & { photoUrls: string[] }
