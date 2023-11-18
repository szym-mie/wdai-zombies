import Position from './Position.js'
import BoundingBox from './BoundingBox.js'

/**
 * @typedef {import('./sprite/Sprite.js').default} Sprite
 */

class Renderer {
  /**
   * @constructor
   * @param {HTMLCanvasElement} canvasElement canvas element
   * @param {number} canvasAspectRatio desired aspect ratio
   */
  constructor (canvasElement, canvasAspectRatio) {
    this.canvasElement = canvasElement
    this.canvasCtx = canvasElement.getContext('2d')
    this.canvasAspectRatio = canvasAspectRatio
    this.canvasSize = new Position()
    this.canvasCenter = new Position()
    this.screenBbox = new BoundingBox()
  }

  /**
   * Update canvas params and constrain height to aspect ratio.
   */
  updateCanvasSize () {
    const width = this.canvasCtx.canvas.clientWidth
    const height = width / this.canvasAspectRatio
    this.canvasCtx.canvas.width = width
    this.canvasCtx.canvas.height = height

    this.canvasSize.x = width
    this.canvasSize.y = height

    this.canvasCenter = Renderer.getCenterPosition(this.canvasSize)

    this.screenBbox.setOffset(width, height)
    console.log(this.screenBbox)
  }

  /**
   * Convert from [0, width] to [-half_width, half_width].
   * @param {Position} position screen canvas coords
   * @returns {Position} absolute canvas coords
   */
  fromScreenToAbsolute (position) {
    return new Position().setFrom(position)
      .diff(this.canvasCenter)
  }

  /**
   * Convert from canvas absolute units to [-1, 1] viewport coord system.
   * @param {Position} position absolute canvas coords
   * @returns {Position} viewport coord system position
   */
  fromAbsoluteToViewportCoords (position) {
    return new Position().setFrom(position)
      .divide(this.canvasCenter)
  }

  /**
   * Convert from [-1, 1] viewport coord system to canvas absolute units.
   * @param {Position} position viewport coord system position
   * @returns {Position} absolute canvas coords
   */
  fromViewportCoordToAbsolute (position) {
    return new Position().setFrom(position)
      .multiply(this.canvasCenter)
  }

  /**
   * Draw an image bitmap with current transformation.
   * @param {ImageBitmap} bitmap image bitmap
   */
  drawBitmap (bitmap) {
    const cx = Math.floor(bitmap.width / 2)
    const cy = Math.floor(bitmap.height / 2)
    this.canvasCtx.drawImage(bitmap, -cx, -cy)
  }

  /**
   * Draw a sprite with current transformation.
   * @param {Sprite} sprite sprite to draw
   * @param {number} frame sprite frame
   * @param {RenderTransformation} transformation transformation
   */
  drawSprite (sprite, frame, transformation) {
    transformation.apply()
    this.drawBitmap(sprite.getFrameBitmap(frame))
    this.canvasCtx.resetTransform()
  }

  /**
   * Draw a centered text with transformation.
   * @param {string} text text to draw
   * @param {string} color font color
   * @param {string} fontName font name
   * @param {number} fontSize font size
   * @param {RenderTransformation} transformation transformation
   */
  drawText (text, color, fontName, fontSize, transformation) {
    transformation.apply()
    this.canvasCtx.fillStyle = color
    this.canvasCtx.textAlign = 'center'
    this.canvasCtx.textBaseline = 'middle'
    this.canvasCtx.font = fontSize + 'px ' + fontName
    this.canvasCtx.fillText(text, 0, 0)
    this.canvasCtx.resetTransform()
  }

  /**
   * Register resize event listener.
   */
  registerEvents () {
    const onResize = _ev => this.updateCanvasSize()

    window.addEventListener('resize', onResize, false)
  }

  /**
   * Create a new transformation.
   * @returns {RenderTransformation} new transformation
   */
  withTransform () {
    return new RenderTransformation(this, this.canvasCenter)
  }

  /**
   * Create a new transformation, with specified origin.
   * @param {Position} origin origin of transformation
   * @returns {RenderTransformation} new transformation
   */
  withTransformOfOrigin (origin) {
    return new RenderTransformation(this, origin)
  }

  /**
   * Get center of size position.
   * @param {Position} position input position
   * @returns {Position} get center position
   */
  static getCenterPosition (position) {
    const cx = Math.floor(position.x / 2)
    const cy = Math.floor(position.y / 2)
    return new Position(cx, cy)
  }
}

class RenderTransformation {
  /**
   * @constructor
   * @param {Renderer} renderer renderer to be used when applying transformation
   * @param {Position} origin origin of the transform
   */
  constructor (renderer, origin) {
    this.renderer = renderer
    this.origin = origin
    this.matrix = [1, 0, 0, 1, 0, 0]
    this.position = new Position()
    this.rotation = 0
    this.scale = 1
  }

  /**
   * Set this transformation.
   * @param {Renderer} renderer renderer
   */
  apply () {
    const cx = this.origin.x
    const cy = this.origin.y
    this.renderer.canvasCtx.translate(cx, cy)
    this.renderer.canvasCtx.transform(...this.matrix)
  }

  /**
   * Set position.
   * @param {Position} position new position
   * @returns {RenderTransformation} this transformation
   */
  positionOf (position) {
    this.position = position
    this.matrix[4] = position.x
    this.matrix[5] = position.y
    return this
  }

  /**
   * Rotate around position.
   * @param {number} rotation rotation in radians
   * @returns {RenderTransformation} this transformation
   */
  rotationOf (rotation) {
    this.rotation = rotation
    const c = Math.cos(rotation)
    const s = Math.sin(rotation)

    const rotationMatrix = [c, s, -s, c, 0, 0]
    this.matrix = RenderTransformation.multiplyMatrix(this.matrix, rotationMatrix)

    return this
  }

  /**
   * Scale around position.
   * @param {number} scale scale of transformation
   * @returns {RenderTransformation} this transformation
   */
  scaleOf (scale) {
    const scaleMatrix = [scale, 0, 0, scale, 0, 0]
    this.matrix = RenderTransformation.multiplyMatrix(this.matrix, scaleMatrix)
    return this
  }

  /**
   * Scale to fit renderer height.
   * @param {Sprite} sprite sprite to fit
   * @param {number} frame frame to use
   */
  fitHeight (sprite, frame) {
    const h = this.renderer.canvasSize.y
    return this.scaleOf(h / sprite.getFrameBitmap(frame).height)
  }

  /**
   * @private
   * Multiply two matrices, translation comes from first matrix.
   * @param {number[]} m0 first matrix
   * @param {number[]} m1 second matrix
   * @returns {number[]} new matrix
   */
  static multiplyMatrix (m0, m1) {
    const mo = [0, 0, 0, 0, m0[4], m0[5]]
    mo[0] = m0[0] * m1[0] + m0[1] * m1[2]
    mo[1] = m0[0] * m1[1] + m0[1] * m1[3]
    mo[2] = m0[2] * m1[0] + m0[3] * m1[2]
    mo[3] = m0[2] * m1[1] + m0[3] * m1[3]
    return mo
  }
}

export default Renderer
