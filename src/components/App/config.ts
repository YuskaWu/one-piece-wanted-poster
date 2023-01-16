import { AppState } from '../../store'

export const WARCRIMINAL_POSTER = {
  shadow: 5,
  contrast: 105,
  grayscale: 35,
  saturate: 80,
  sepia: 40,
  name: 'PUTLER',
  bounty: 'War Criminal',
  nameSpacing: 0,
  bountySpacing: 1,
  avatarUrls: [
    './images/war-criminal/photo-01.png',
    './images/war-criminal/photo-02.png',
    './images/war-criminal/photo-03.png'
  ]
} satisfies Partial<AppState> & { avatarUrls: string[] }
