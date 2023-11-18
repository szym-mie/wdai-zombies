import Entity from '../Entity.js'
import BoundingBox from '../BoundingBox.js'

class Zombie extends Entity {
  /**
   * @constructor
   * @param {Position} position position of zomibe
   * @param {Sprite} sprite sprite of the zombie
   * @param {number} depth how far from viewer
   */
  constructor (position, sprite, depth) {
    super(position)
    this.depth = depth
    this.sprite = sprite
    this.bbox = Zombie.bboxDefault

    this.walkAnimationTime = 0
    this.isWalking = true
    this.deathAnimationTime = 0
    this.isDead = false

    this.walkingSpeed = 100
    this.walkingRandomScale = 0.3
    this.walkingRandomPeriod = 2.3
    this.walkingWobbleScale = 0.1
    this.points = Zombie.pointsDefault
  }

  update (deltaTime) {
    super.update(deltaTime)
    const timeUnitRatio = deltaTime / 1000
    const walkingSpeed = this.getWalkingSpeed() * timeUnitRatio
    this.walkAnimationTime += walkingSpeed
    this.position.x += -walkingSpeed * this.getScale()
  }

  render (renderer) {
    const transform = renderer.withTransform()
      .positionOf(this.position)
      .rotationOf(this.getWalkingWobbleRotation())
      .scaleOf(this.getScale())

    const frame = Math.floor(this.walkAnimationTime / Zombie.walkStepTime)
    renderer.drawSprite(this.sprite, frame, transform)
  }

  getScale () {
    return 1 - this.depth
  }

  getWalkingWobbleRotation () {
    const time = this.walkAnimationTime / 1000
    return (
      Math.sin(time * this.walkingSpeed) * this.walkingWobbleScale *
      (Math.sin(time) + Math.cos(time) * 0.43)
    )
  }

  getWalkingSpeed () {
    const time = this.totalTime / 1000
    return this.walkingSpeed * (
      (Math.sin(time * this.walkingRandomPeriod) * this.walkingRandomScale) +
      (Math.cos(time * this.walkingRandomPeriod * 1.38) * this.walkingRandomScale * 0.6) + 1
    )
  }

  /**
   * Test if zombie hit.
   * @param {Position} point hit point
   */
  isHit (point) {
    return this.bbox.isPointInsideWithScale(this, this.getScale(), point)
  }

  die () {
    this.isDead = true
  }

  static pointsDefault = 10
  static bboxDefault = new BoundingBox(160, 310)
  static walkStepTime = 10
}

export default Zombie
