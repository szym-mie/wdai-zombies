class Sprite {
  /**
   * @constructor
   * @param {string} resourcePath URL pointing to the bitmap
   * @param {SpriteFrameDef[]} frameDefs definition of animation frames
   */
  constructor (resourcePath, frameDefs) {
    this.resourcePath = resourcePath
    this.frameDefs = frameDefs
    this.frames = []
    this.isLoaded = false
  }

  /**
   * Load an image and update frame bitmaps.
   * @returns {Promise<ImageBitmap[]>}
   */
  async load () {
    const image = new Image()
    image.src = this.resourcePath

    return new Promise((resolve, reject) => {
      image.onload = async () => resolve(await this.updateFrames(image))
      image.onerror = () => reject(new Error('Bitmap frames cannot be loaded.'))
    })
  }

  /**
   * @async
   * Load and update frames from an image source.
   * @param {ImageBitmapSource} image image source
   * @returns {Promise<ImageBitmap[]>} frame bitmaps
   */
  async updateFrames (image) {
    this.frames = await Promise.all(this.frameDefs.map(frameDef => frameDef.getFrameBitmap(image)))
    this.isLoaded = true
    return this.frames
  }

  /**
   * Get frame bitmap of index.
   * @param {number} frameIndex frame of sprite
   * @returns {ImageBitmap} frame bitmap
   */
  getFrameBitmap (frameIndex) {
    return this.frames[frameIndex % this.frames.length]
  }

  /**
   * Define a frame.
   * @param {number} x lower x
   * @param {number} y lower y
   * @param {number} w width of frame
   * @param {number} h height of frame
   * @returns {SpriteFrameDef} frame def
   */
  static frameDef (x, y, w, h) {
    return new SpriteFrameDef(x, y, w, h)
  }

  /**
   * Define a full frame.
   * @returns {SpriteFrameDef} frame def
   */
  static fullFrameDef () {
    return new SpriteFrameDef(0, 0)
  }

  /**
   * Define a row of frames taken from source bitmap.
   * @param {number} x lower x
   * @param {number} y lower y
   * @param {number} w width of frames
   * @param {number} h height of frames
   * @param {number} n number of frames in a row
   * @returns {SpriteFrameDef[]} frames defs
   */
  static rowFrameDefs (x, y, w, h, n) {
    return new Array(n).fill(null)
      .map((_, i) => new SpriteFrameDef(x + w * i, y, w, h))
  }
}

class SpriteFrameDef {
  /**
   * @constructor
   * @param {number} x lower x component
   * @param {number} y lower y component
   * @param {number} [w] width of frame
   * @param {number} [h] height of frame
   */
  constructor (x, y, w, h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  /**
   * @async
   * Get image bitmap for frame.
   * @param {ImageBitmapSource} bitmapSource source image for frame bitmap
   * @returns {Promise<ImageBitmap>} await image bitmap
   */
  async getFrameBitmap (bitmapSource) {
    const rw = this.w || bitmapSource.width
    const rh = this.h || bitmapSource.height
    return await createImageBitmap(bitmapSource, this.x, this.y, rw, rh)
  }
}

export default Sprite
