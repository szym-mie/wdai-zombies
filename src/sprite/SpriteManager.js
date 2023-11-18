/**
 * @typedef {import('./Sprite.js').default} Sprite
 */

class SpriteManager {
  /**
   * @constructor
   */
  constructor () {
    this.sprites = new Map()
  }

  /**
   * Add a sprite.
   * @param {string} name name of sprite
   * @param {Sprite} sprite sprite to add
   */
  add (name, sprite) {
    this.sprites.set(name, sprite)
  }

  /**
   * @async
   * Load all sprites.
   * @return {Promise<Map<string, Sprite>>}
   */
  async load () {
    const loadPromises = [...this.sprites.values()]
      .map(sprite => sprite.load())

    await Promise.all(loadPromises)
    return this.sprites
  }

  /**
   * Get a sprite by name.
   * @param {string} name name of sprite
   * @returns {Sprite} loaded sprite
   */
  get (name) {
    const sprite = this.sprites.get(name)
    if (!sprite.isLoaded) throw new Error('Sprite not loaded.')
    return sprite
  }
}

export default SpriteManager
