export interface PosterCanvasElement extends HTMLCanvasElement {
  domWidth: number
  domHeight: number
}

export interface PosterRenderingContext2D extends CanvasRenderingContext2D {
  canvas: PosterCanvasElement
}

export type Position = {
  x: number
  y: number
  width: number
  height: number
}

export type WantedImageInfo = {
  url: string
  avatarPosition: Position
  namePosition: Position
  bountyPosition: Position
  bountyFontSize: number
  // The wanted image has irregularly transparent edges, the boundaryOffset is used
  // to prevent avatar to be rendered on thease parts.
  boundaryOffset: {
    left: number
    right: number
    top: number
    bottom: number
  }
  bellyMarginRight: number
}
