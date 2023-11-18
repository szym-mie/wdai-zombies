import Entity from '../Entity.js'
import BoundingBox from '../BoundingBox.js'
import Position from '../Position.js'

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
    this.rotation = 0
    this.scale = 1 - this.depth
    this.sprite = sprite
    this.bbox = Zombie.bboxDefault

    this.walkAnimationTime = 0
    this.walkingFrame = 0
    this.isWalking = true
    this.deathAnimationTime = 0
    this.isDead = false

    this.walkingSpeed = 100
    this.walkingRandomScale = 0.3
    this.walkingRandomPeriod = 2.3
    this.walkingWobbleScale = 0.1

    this.flyVelocity = new Position()
    this.flyDepth = 1

    this.points = Zombie.pointsDefault
  }

  update (deltaTime) {
    super.update(deltaTime)
    const timeUnitRatio = deltaTime / 1000
    if (!this.isDead) {
      const walkingSpeed = this.getWalkingSpeed() * timeUnitRatio
      this.walkAnimationTime += walkingSpeed
      this.walkingFrame = Math.floor(this.walkAnimationTime / Zombie.walkStepTime)

      this.position.x += -walkingSpeed * this.scale
      this.rotation = this.getWalkingWobbleRotation()
    } else {
      this.deathAnimationTime += deltaTime
      this.walkingFrame = 0

      const frameVelocity = new Position().setFrom(this.flyVelocity).scale(timeUnitRatio)
      const gravityAcceleration = new Position(0, Zombie.flyGravity).scale(timeUnitRatio)

      this.flyDepth += Zombie.flyDepthSpeed * timeUnitRatio
      this.flyVelocity.add(gravityAcceleration)
      this.position.add(frameVelocity.scale(this.scale))
      this.rotation += Zombie.flyRotation * timeUnitRatio
      this.scale = this.depth / this.flyDepth
    }
  }

  render (renderer) {
    const transform = renderer.withTransform()
      .positionOf(this.position)
      .rotationOf(this.rotation)
      .scaleOf(this.scale)

    renderer.drawSprite(this.sprite, this.walkingFrame, transform)
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
    return this.bbox.isPointInsideWithScale(this, this.scale, point)
  }

  die () {
    this.isDead = true
    this.deathAnimationTime = 0
    this.flyVelocity = new Position().setFromAngle(Math.random() * 2 - 1).scale(-Zombie.flySpeed)
  }

  static pointsDefault = 10
  static bboxDefault = new BoundingBox(180, 310)
  static walkStepTime = 10
  static flySpeed = 4000
  static flyDepthSpeed = 20
  static flyGravity = 2500
  static flyRotation = 8
}

export default Zombie
