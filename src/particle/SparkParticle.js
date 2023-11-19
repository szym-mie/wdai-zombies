import Particle from '../Particle'
import Position from '../Position'

class SparkParticle extends Particle {
  constructor (position) {
    super(position, SparkParticle.getStartVelocity())
    this.tailPosition = position.copy()
  }

  static getStartVelocity () {
    const angle = Math.random() * 2 * Math.PI
    return new Position().setFromAngle(angle).scale(SparkParticle.startSpeed)
  }

  update (deltaTime) {
    super.update(deltaTime)
    this.tailPosition.lerp(this.position, 0.2)
  }

  render (renderer) {
    const transform = renderer.withTransform()
    renderer.drawLine(this.position, this.tailPosition, transform)
  }

  isDead () {
    return false
  }

  static startSpeed = 800
}

export default SparkParticle
