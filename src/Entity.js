import Position from './Position.js'
import Updateable from './Updateable.js'

/**
 * @typedef {import('./Renderer.js').default} Renderer
 */

/**
 * @abstract
 * Game entity that is to be updated every frame and can be drawn on a canvas.
 * Override 'draw' and 'update' methods to create entity logic.
 */
class Entity extends Updateable {
  /**
   * @constructor
   * @param {Position} position entity position
   */
  constructor (position) {
    super()
    this.position = new Position().setFrom(position)
    this.totalTime = 0
  }

  /**
   * Update object's state + add to total time.
   * @param {number} deltaTime delta of time passed between updates
   */
  update (deltaTime) {
    if (!Number.isNaN(deltaTime)) {
      this.totalTime += deltaTime
    }
  }

  /**
   * @abstract
   * Prepare transformations and render.
   * @param {Renderer} renderer renderer to apply to.
   */
  render (renderer) {
    throw new TypeError('Entity class ' + this.constructor.name + ' does not override render method.')
  }
}

export default Entity
