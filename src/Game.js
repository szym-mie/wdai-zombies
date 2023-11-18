import KeyOrderedMap from './KeyOrderedMap.js'
import Position from './Position.js'
import Renderer from './Renderer.js'

import Backdrop from './entity/Backdrop.js'
import Crosshair from './entity/Crosshair.js'
import Zombie from './entity/Zombie.js'

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

    this.backdrop = new Backdrop(spriteManager.get('backdrop'))

    this.crosshair = new Crosshair(Position.zero, spriteManager.get('crosshair'))

    this.zombieFactory = (position, depth) => new Zombie(position, spriteManager.get('zombie'), depth)

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

    this.score = 0
    this.lives = 3
  }

  /**
   * Get all zombies.
   * @returns {Zombie[]} all zombies
   */
  getZombies () {
    return [...this.zombies.values()]
  }

  spawnZombie () {
    const ratio = Math.random()
    const height = 0.8 - ratio * 0.35

    const viewportPosition = new Position(0.99, height)
    const position = this.renderer.fromViewportCoordToAbsolute(viewportPosition)

    const depth = 0.55 + ratio * 0.15
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
    this.despawnZombie(zombie)
    this.score += zombie.points
  }

  zombieGotPast (zombie) {
    this.despawnZombie(zombie)
    if (--this.lives === 0) this.endGame()
  }

  despawnZombie (zombie) {
    this.zombies.delete(zombie)
    this.removeZombieFromDrawList(zombie)
  }

  shoot () {
    this.crosshair.startWobble()
    this.getZombies()
      .filter(zombie => zombie.isHit(this.crosshair.position))
      .sort(Game.depthOrder)
      .forEach(zombie => this.killZombie(zombie))
  }

  endGame () {
    // TODO
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
    this.getZombies().forEach(zombie => zombie.update(deltaTime))
    this.crosshair.update(deltaTime)

    if (this.totalTime > this.nextSpawnTime) {
      this.nextSpawnTime = this.totalTime + (this.spawnPeriod * (0.8 + Math.random() * 0.7))
      this.spawnZombie()
    }

    this.getZombies()
      .filter(zombie => this.isEntityOutOfBounds(zombie))
      .forEach(zombie => this.despawnZombie(zombie))
  }

  redraw () {
    this.backdrop.render(this.renderer)
    for (const zombieDepthList of this.zombieDrawList.values()) {
      for (const zombie of zombieDepthList) zombie.render(this.renderer)
    }
    this.crosshair.render(this.renderer)
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

  static depthOrder = (depthA, depthB) => depthB - depthA

  static aspectRatio = 16 / 9

  static pointsDecrementWhenShoot = 1
  static minTimeBetweenSpawnsDefault = 500
}

export default Game
