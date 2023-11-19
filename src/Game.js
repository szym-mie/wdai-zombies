import KeyOrderedMap from './KeyOrderedMap.js'
import Position from './Position.js'
import Renderer from './Renderer.js'

import Backdrop from './entity/Backdrop.js'
import Crosshair from './entity/Crosshair.js'
import PlayerStatus from './entity/PlayerStatus.js'
import Zombie from './entity/Zombie.js'
import SparkParticleSpace from './particle/SparkParticleSpace.js'

/**
 * @typedef {import('./sprite/SpriteManager.js').default} SpriteManager
 */

class Game {
  /**
   * @constructor
   * @param {SpriteManager} spriteManager backdrop to fit canvas
   * @param {HTMLCanvasElement} canvasElement canvas to draw on
   */
  constructor (spriteManager, canvasElement) {
    this.resetGameState()

    this.spriteManager = spriteManager
    this.renderer = new Renderer(canvasElement, Game.aspectRatio)
    this.renderer.registerEvents()
    this.renderer.updateCanvasSize()
    this.totalTime = 0

    this.playerStatus = new PlayerStatus(this, spriteManager.get('heart'), 'Pixelify Sans', 60)

    this.backdrop = new Backdrop(spriteManager.get('backdrop'))

    this.crosshair = new Crosshair(Position.zero, spriteManager.get('crosshair'))

    this.zombieFactory = (position, depth) => new Zombie(position, spriteManager.get('zombie'), depth)

    this.particleSpaces = new Set()

    this.registerEvents()

    this.zombieSpawnsDepths = [0.55, 0.6, 0.65, 0.7]
    this.zombieSpawnsHeight = [0.8, 0.64, 0.55, 0.45]
  }

  resetGameState () {
    this.nextSpawnTime = Game.minTimeBetweenSpawnsDefault
    this.spawnPeriod = Game.minTimeBetweenSpawnsDefault
    this.zombies = new Set()
    this.zombieDrawList = new KeyOrderedMap(Game.depthOrder)
    this.nextZombieId = 0

    this.score = 10
    this.lives = 3

    this.isPaused = false
    this.isDead = false
  }

  /**
   * Get all zombies.
   * @returns {Zombie[]} all zombies
   */
  getZombies () {
    return [...this.zombies.values()]
  }

  spawnZombie () {
    const level = Game.stepFromUnitRange(Math.random(), 16)
    const height = 0.8 - level * 0.35

    const viewportPosition = new Position(0.99, height)
    const position = this.renderer.fromViewportCoordToAbsolute(viewportPosition)

    const depth = 0.55 + level * 0.15
    const zombie = this.zombieFactory(position, depth)
    zombie.walkingSpeed = 100 + Math.random() * 100
    this.zombies.add(zombie)
    this.addZombieToDrawList(zombie)
  }

  addZombieToDrawList (zombie) {
    const depth = zombie.depth
    const depthZombieList = this.zombieDrawList.get(depth)
    try {
      depthZombieList.add(zombie)
    } catch (e) {
      if (e instanceof TypeError) {
        this.zombieDrawList.set(depth, new Set([zombie]))
      }
    }
  }

  removeZombieFromDrawList (zombie) {
    const depth = zombie.depth
    const depthList = this.zombieDrawList.get(depth)
    depthList.delete(zombie)
  }

  killZombie (zombie) {
    zombie.die()
    this.score += zombie.points
  }

  getParticleSpaces () {
    return [...this.particleSpaces.values()]
  }

  removeParticleSpace (particleSpace) {
    console.log(particleSpace)
    particleSpace.removeParticles()
    this.particleSpaces.delete(particleSpace)
    console.log(this.particleSpaces)
  }

  createSparks (position) {
    const sparks = new SparkParticleSpace(position, 1)
    sparks.spawnParticles()
    this.particleSpaces.add(sparks)
  }

  zombieGotPast (zombie) {
    this.despawnZombie(zombie)
    this.playerStatus.lostHeart()
    if (--this.lives === 0) this.endGame()
  }

  despawnZombie (zombie) {
    this.zombies.delete(zombie)
    this.removeZombieFromDrawList(zombie)
  }

  shoot () {
    if (this.score === 0 || this.isPaused || this.isDead) return
    const shotZombie = this.getZombies()
      .filter(zombie => zombie.isHit(this.crosshair.position))
      .sort(Game.depthOrder)
      .reverse()[0]
    if (shotZombie !== undefined) {
      this.killZombie(shotZombie)
    }
    this.createSparks(this.crosshair.position)
    this.crosshair.startWobble()
    this.playerStatus.shotFired()
    this.score--
  }

  endGame () {
    this.isDead = true
  }

  /**
   * Test if entity outside of visible screen.
   * @param {Entity} entity entity to test
   * @returns {boolean} is inside screen (center of entity)
   */
  isEntityOutOfBounds (entity) {
    return !this.renderer.screenBbox.isPointInsideAbsolute(entity.position)
  }

  update (deltaTime) {
    this.playerStatus.update(deltaTime)
    if (this.isPaused) return

    this.getZombies().forEach(zombie => zombie.update(deltaTime))
    this.getParticleSpaces().forEach(particleSpace => particleSpace.update(deltaTime))
    if (!this.isDead) this.crosshair.update(deltaTime)

    if (this.totalTime > this.nextSpawnTime) {
      this.nextSpawnTime = this.totalTime + (this.spawnPeriod * (0.8 + Math.random() * 0.7))
      this.spawnZombie()
    }

    this.getZombies()
      .filter(zombie => this.isEntityOutOfBounds(zombie))
      .forEach(zombie => !zombie.isDead ? this.zombieGotPast(zombie) : this.despawnZombie(zombie))

    this.getParticleSpaces()
      .filter(particleSpace => particleSpace.isEmpty())
      .forEach(particleSpace => this.removeParticleSpace(particleSpace))
  }

  redraw () {
    this.backdrop.render(this.renderer)
    for (const zombieDepthList of this.zombieDrawList.values()) {
      for (const zombie of zombieDepthList) zombie.render(this.renderer)
    }
    for (const particleSpace of this.particleSpaces) {
      particleSpace.render(this.renderer)
    }
    this.crosshair.render(this.renderer)
    this.playerStatus.render(this.renderer)
  }

  loop (time = 0) {
    const deltaTime = Math.max(time - this.totalTime, 0.001)
    this.totalTime = time
    this.update(deltaTime)
    this.redraw()

    requestAnimationFrame(this.loop.bind(this))
  }

  /**
   * Register mouse events listeners.
   */
  registerEvents () {
    const onMouseMove = ev => this.setCrosshairTargetPosition(ev)
    const onMouseDown = _ev => this.shoot()

    this.renderer.canvasElement.addEventListener('mousemove', onMouseMove, false)
    this.renderer.canvasElement.addEventListener('mousedown', onMouseDown, false)
  }

  setCrosshairTargetPosition (ev) {
    const screenPosition = new Position(ev.offsetX, ev.offsetY)
    this.crosshair.targetPosition = this.renderer.fromScreenToAbsolute(screenPosition)
  }

  static stepFromUnitRange (n, steps) {
    return Math.floor(n * steps) / steps
  }

  static depthOrder = (depthA, depthB) => depthB - depthA

  static aspectRatio = 16 / 9

  static pointsDecrementWhenShoot = 1
  static minTimeBetweenSpawnsDefault = 500
}

export default Game
