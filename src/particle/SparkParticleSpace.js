import ParticleSpace from '../ParticleSpace'
import SparkParticle from './SparkParticle'

class SparkParticleSpace extends ParticleSpace {
  constructor (originPostion, scale) {
    super(originPostion, SparkParticleSpace.widthDefault, SparkParticleSpace.heightDefault)
    this.scale = scale

    this.isSpaceUnlimited = false
    this.maxParticles = SparkParticleSpace.maxParticles
  }

  spawnParticles () {
    for (let i = 0; i < SparkParticleSpace.spawnAmount; i++) {
      this.addParticle(new SparkParticle(this.position.copy()))
    }
  }

  render (renderer) {
    const gradient = renderer.getRadialGradient(
      this.position,
      SparkParticleSpace.radiusDefault,
      'rgba(214, 176, 107, 1.0)',
      'rgba(214, 176, 107, 0.1)'
    )
    renderer.setLineStyle(gradient, 6)
    super.render(renderer)
  }

  static spawnAmount = 32
  static maxParticles = 32
  static radiusDefault = 100
  static widthDefault = 200
  static heightDefault = 200
}

export default SparkParticleSpace
