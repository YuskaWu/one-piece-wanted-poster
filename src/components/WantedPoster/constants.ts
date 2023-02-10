import bellySignImageUrl from './images/belly.png'
import wantedImageUrl from './images/one-piece-wanted.png'
import { WantedImageInfo } from './types'

export const ONE_PIECE_WANTED_IMAGE: WantedImageInfo = {
  imageUrl: wantedImageUrl,
  bellyImageUrl: bellySignImageUrl,
  photoPosition: { x: 74, y: 252, width: 638, height: 484 },
  namePosition: { x: 87, y: 826, width: 586, height: 114 },
  bountyInfo: {
    x: 82,
    y: 958,
    width: 592,
    height: 85,
    bellyMarginRight: 18,
    fontSize: 70
  },
  boundaryOffset: {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10
  }
}
