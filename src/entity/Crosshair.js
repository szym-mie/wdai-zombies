import Entity from '../Entity.js'
import Position from '../Position.js'

class Crosshair extends Entity {
  /**
   * @constructor
   * @param {Position} position position of crosshair
   * @param {Sprite} sprite sprite to draw
   */
  constructor (position, sprite) {
    super(position)
    this.rotation = 0
    this.scale = 0.1
    this.targetScale = 0.1
    this.sprite = sprite
    this.targetPosition = new Position(0, 0)
    this.moveRotationStrength = 0.01
    this.moveRotationScale = 0.16
    this.wobbleTargetScale = 300
    this.wobbleTargetDuration = 1500
    this.wobbleTime = this.wobbleTargetDuration
    this.wobblePatternCyclesPosition = 3
    this.wobblePatternCyclesRotation = 5
    this.wobblePatternCyclesScale = 3
    this.wobblePatternScale = 0.05
    this.wobbleFollowStrength = 10
  }

  startWobble () {
    this.wobbleTime = 0
  }

  getWobblePatternPosition () {
    const patternRamp = Math.min(this.wobbleTime / this.wobbleTargetDuration, 1)
    const patternTime = patternRamp * this.wobblePatternCyclesPosition
    const patternDamp = (1 - patternRamp) ** 4 * this.wobbleTargetScale

    const timePi = patternTime * Math.PI
    return new Position(
      Math.cos(3 * timePi) * Math.sin(2 * timePi) * patternDamp,
      -Math.sin(3 * timePi) * patternDamp
    )
  }

  getMovePatternRotation () {
    const velocity = new Position().setFrom(this.targetPosition).diff(this.position)
    const deflection = (Math.abs(velocity.x) * this.moveRotationStrength + Math.PI / 10)
    return Math.sign(velocity.x) * (Math.cos(1 / (deflection)) + 1) * this.moveRotationScale
  }

  getWobblePatternRotation () {
    const patternRamp = Math.min(this.wobbleTime / this.wobbleTargetDuration, 1)
    const patternTime = patternRamp * this.wobblePatternCyclesRotation
    const patternDamp = 1 - patternRamp

    const timePi = patternTime * Math.PI
    return -Math.sin(patternDamp * timePi) * patternDamp
  }

  getWobblePatternScale () {
    const patternRamp = Math.min(this.wobbleTime / this.wobbleTargetDuration, 1)
    const patternTime = patternRamp * this.wobblePatternCyclesScale
    const patternDamp = 1 - patternRamp

    const timePi = patternTime * Math.PI
    return this.targetScale + Math.sin(patternDamp * timePi) * patternDamp * this.wobblePatternScale
  }

  update (deltaTime) {
    super.update(deltaTime)
    this.wobbleTime += deltaTime
    const timeUnitRatio = deltaTime / 1000
    const lerpRatio = Math.min(this.wobbleFollowStrength * timeUnitRatio, 0.99)

    this.position.lerp(this.getWobblePatternPosition().add(this.targetPosition), lerpRatio)
    this.rotation = this.getMovePatternRotation() + this.getWobblePatternRotation()
    this.scale = this.getWobblePatternScale()
  }

  render (renderer) {
    const transform = renderer.withTransform()
      .positionOf(this.position)
      .rotationOf(this.rotation)
      .scaleOf(this.scale)

    renderer.drawSprite(this.sprite, 0, transform)
  }
}

export default Crosshair
