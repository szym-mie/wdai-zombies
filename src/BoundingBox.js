/**
 * @typedef {import('./Position.js').default} Position
 * @typedef {import('./Entity.js').default} Entity
 */

import Position from './Position.js'

class BoundingBox {
  /**
   * @constructor
   * @param {number} width width of the bounding box
   * @param {number} height height of the bounding box
   */
  constructor (width, height) {
    this.setOffset(width, height)
  }

  setOffset (width, height) {
    this.width = width
    this.height = height
    this.halfOffset = new Position(this.width / 2, this.height / 2)
  }

  /**
   * Test if point is inside a bounding box positioned on (0, 0).
   * @param {Position} point point to test
   * @returns {boolean} true if inside
   */
  isPointInsideAbsolute (point) {
    return BoundingBox.testPointInOffsetArea(Position.zero, this.halfOffset, point)
  }

  /**
   * Test if point is inside a bounding box positioned on top of the entity.
   * @param {Entity} entity entity linked to the bounding box
   * @param {Position} point point to test
   * @returns {boolean} true if inside
   */
  isPointInside (entity, point) {
    return BoundingBox.testPointInOffsetArea(entity.position, this.halfOffset, point)
  }

  /**
   * Test if point is inside a scaled bounding box positioned on top of the entity.
   * @param {Entity} entity entity linked to the bounding box
   * @param {number} scale scale to apply to a corner offset
   * @param {Position} point point to test
   * @returns {boolean} true if inside
   */
  isPointInsideWithScale (entity, scale, point) {
    const scaledHalfOffset = new Position().setFrom(this.halfOffset).scale(scale)
    return BoundingBox.testPointInOffsetArea(entity.position, scaledHalfOffset, point)
  }

  /**
   * Test if point in bounding box - primitive.
   * @param {Position} center center of bounding box
   * @param {Position} halfOffset corner offset from center
   * @param {Position} point point to test
   * @returns {boolean} true if point inside
   */
  static testPointInOffsetArea (center, halfOffset, point) {
    const upperCorner = new Position().setFrom(center).add(halfOffset)
    const lowerCorner = new Position().setFrom(center).diff(halfOffset)

    return (
      upperCorner.x > point.x && lowerCorner.x < point.x &&
      upperCorner.y > point.y && lowerCorner.y < point.y
    )
  }
}

export default BoundingBox
