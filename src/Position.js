class Position {
  /**
   * @constructor
   * @param {number} [x] first component
   * @param {number} [y] second component
   */
  constructor (x, y) {
    this.x = x || 0
    this.y = y || 0
  }

  /**
   * Set components.
   * @param {number} x x
   * @param {number} y y
   * @returns {Position} this position
   */
  setTo (x, y) {
    this.x = x
    this.y = y
    return this
  }

  /**
   * Copy components from position.
   * @param {Position} position position to set from
   * @returns {Position} this position
   */
  setFrom (position) {
    this.x = position.x
    this.y = position.y
    return this
  }

  /**
   * Set unit vector from rotation angle.
   * @param {number} angle angle to set
   * @returns {Position} this position
   */
  setFromAngle (angle) {
    this.x = Math.sin(angle)
    this.y = Math.cos(angle)
    return this
  }

  /**
   * Add a position.
   * @param {Position} position position to add
   * @returns {Position} this position
   */
  add (position) {
    this.x += position.x
    this.y += position.y
    return this
  }

  /**
   * Difference of another position.
   * @param {Position} position position to subtract
   * @returns {Position} this position
   */
  diff (position) {
    this.x -= position.x
    this.y -= position.y
    return this
  }

  /**
   * Multiply by another position.
   * @param {Position} position position to multiply
   * @returns {Position} this position
   */
  multiply (position) {
    this.x *= position.x
    this.y *= position.y
    return this
  }

  /**
   * Multiply by another position.
   * @param {Position} position position to multiply
   * @returns {Position} this position
   */
  divide (position) {
    if (position.x === 0 || position.y === 0) return this
    this.x /= position.x
    this.y /= position.y
    return this
  }

  /**
   * Scale a position by number.
   * @param {number} scale scale to apply
   * @returns {Position} this position
   */
  scale (scale) {
    this.x *= scale
    this.y *= scale
    return this
  }

  /**
 * Normalize this position.
 * @returns {Position} this position
 */
  normalize () {
    const length = this.length()
    if (length !== 0) this.scale(1 / length)
    return this
  }

  /**
   * Lerp with another position.
   * @param {Position} position another position
   * @param {number} k factor of lerp
   * @returns {Position} this position
   */
  lerp (position, k) {
    this.x = this.x * (1 - k) + position.x * k
    this.y = this.y * (1 - k) + position.y * k
    return this
  }

  /**
   * Get length of this position.
   * @returns {number} length of the vector
   */
  length () {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  static zero = new Position()
}

export default Position
