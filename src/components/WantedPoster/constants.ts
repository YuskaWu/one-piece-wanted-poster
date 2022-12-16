import onePieceWantedImageUrl from './images/one-piece-wanted.png'
import { WantedImageInfo } from './types'

export const ONE_PIECE_WANTED_IMAGE: WantedImageInfo = {
  url: onePieceWantedImageUrl,
  width: 772,
  height: 1154,
  avatarPosition: { x: 74, y: 252, width: 638, height: 484 },
  namePosition: { x: 87, y: 826, width: 585, height: 114 },
  bountyPosition: {
    x: 84,
    y: 958,
    width: 584,
    height: 85
  },
  bountyFontSize: 70,
  boundaryOffset: {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10
  },
  bellySignSize: {
    width: 59,
    height: 83
  }
}
