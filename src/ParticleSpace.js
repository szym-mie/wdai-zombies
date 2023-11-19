import BoundingBox from './BoundingBox'
import Entity from './Entity'

class ParticleSpace extends Entity {
  /**
   * @constructor
   * @param {Position} originPosition origin of the space
   * @param {number} width width of the space
   * @param {number} height height of the space
   */
  constructor (originPosition, width, height) {
    super(originPosition)
    this.bbox = new BoundingBox(width, height)

    this.particles = new Set()
    this.isSpaceUnlimited = true
    this.maxParticles = 0
  }

  /**
   * Get a particle array.
   * @returns {Particle[]} all active particles
   */
  getParticles () {
    return [...this.particles.values()]
  }

  /**
   * Try adding particle to the space. If space limited, particle won't be
   * added when particle count greater or equal to maxParticles.
   * Implement your spawning logic with this method.
   * @param {Particle} particle particle to add
   */
  addParticle (particle) {
    if (this.particles.size < this.maxParticles || this.isSpaceUnlimited) {
      this.particles.add(particle)
      particle.position.setFrom(this.position)
      particle.lastPosition.setFrom(this.position)
    }
  }

  /**
   * Update all particles in the space.
   * @param {number} deltaTime delta of time to pass
   */
  updateParticles (deltaTime) {
    this.getParticles()
      .forEach(particle => particle.update(deltaTime))
  }

  /**
   * Remove all particles which are completely out of bounds.
   */
  removeParticlesOutOfBounds () {
    this.getParticles()
      .filter(particle =>
        !this.bbox.isPointInside(this, particle.lastPosition)
      )
      .forEach(particle => this.particles.delete(particle))
  }

  /**
   * Remove all particles which are dead (by their own metric).
   */
  removeDeadParticles () {
    this.getParticles()
      .filter(particle => particle.isDead())
      .forEach(particle => this.particles.delete(particle))
  }

  /**
   * Test if particle space is empty.
   * @returns {boolean} true if no particles in space
   */
  isEmpty () {
    return this.particles.size === 0
  }

  /**
   * Remove this space by removing all particles.
   */
  removeParticles () {
    this.particles.clear()
  }

  /**
   * Particle space update - remove dead particles and those out of bounds,
   * update remaining.
   * @param {number} deltaTime delta of time
   */
  update (deltaTime) {
    super.update(deltaTime)
    this.removeParticlesOutOfBounds()
    this.removeDeadParticles()
    this.updateParticles(deltaTime)
  }

  /**
   * Render the particle system. Extend to create your own rendering logic.
   * @param {Renderer} renderer renderer to use
   */
  render (renderer) {
    this.getParticles()
      .forEach(particle => particle.render(renderer))
  }
}

export default ParticleSpace
