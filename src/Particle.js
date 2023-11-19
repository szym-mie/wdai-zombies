import Entity from './Entity'
import Position from './Position'

class Particle extends Entity {
  constructor (position, velocity) {
    super(position)
    this.lastPosition = new Position()
    this.velocity = velocity
  }

  /**
   * @abstract
   * Determine if particle is dead. You can use any predicate you want.
   * @returns {boolean} true if dead
   */
  isDead () {
    throw new TypeError('Particle class ' + this.constructor.name + ' does not override isDead method.')
  }

  update (deltaTime) {
    super.update(deltaTime)
    const unitTimeDelta = Entity.getUnitTime(deltaTime)
    this.lastPosition.setFrom(this.position)

    const frameVelocity = this.velocity.copy().scale(unitTimeDelta)
    this.position.add(frameVelocity)
  }
}

export default Particle
