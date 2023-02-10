export interface PosterCanvasElement extends HTMLCanvasElement {
  domWidth: number
  domHeight: number
}

export interface PosterRenderingContext2D extends CanvasRenderingContext2D {
  canvas: PosterCanvasElement
}

export interface Position {
  x: number
  y: number
  width: number
  height: number
}

export interface BountyInfo extends Position {
  bellyMarginRight: number
  fontSize: number
}

export type WantedImageInfo = {
  imageUrl: string
  bellyImageUrl: string
  photoPosition: Position
  namePosition: Position
  bountyInfo: BountyInfo
  // The wanted image has irregularly transparent edges, the boundaryOffset is used
  // to prevent photo to be rendered on thease parts.
  boundaryOffset: {
    left: number
    right: number
    top: number
    bottom: number
  }
}
