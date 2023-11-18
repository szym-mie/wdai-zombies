/**
 * @abstract
 * Any object that should have it's state updated every frame should inherit
 * this class and implement 'update' method.
 */
class Updateable {
  /**
   * @abstract
   * Update object's state.
   * @param {Number} deltaTime delta of time passed between updates
   */
  update (deltaTime) {
    throw new TypeError('Updatable class ' + this.constructor.name + ' does not override update method.')
  }
}

export default Updateable
