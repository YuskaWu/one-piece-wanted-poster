export type Position = {
  x: number
  y: number
  width: number
  height: number
}

export type WantedImageInfo = {
  url: string
  width: number
  height: number
  avatarPosition: Position
  namePosition: Position
  bountyPosition: Position
  bountyFontSize: number
  // for avatar image to avoid rendering on the outside of boundary
  boundaryOffset: {
    left: number
    right: number
    top: number
    bottom: number
  }
  bellySignSize: {
    width: number
    height: number
  }
}
