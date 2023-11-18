import Game from './Game.js'
import Sprite from './sprite/Sprite.js'
import SpriteManager from './sprite/SpriteManager.js'

const main = async () => {
  const spriteManager = new SpriteManager()
  spriteManager.add(
    'backdrop',
    new Sprite('res/sprite/backdrop.png', [Sprite.fullFrameDef()])
  )
  spriteManager.add(
    'heart',
    new Sprite('res/sprite/heart.png', Sprite.rowFrameDefs(0, 0, 90, 90, 2))
  )
  spriteManager.add(
    'zombie',
    new Sprite('res/sprite/zombie.png', Sprite.rowFrameDefs(0, 0, 200, 312, 10))
  )
  spriteManager.add(
    'crosshair',
    new Sprite('res/sprite/crosshair.png', [Sprite.fullFrameDef()])
  )

  await spriteManager.load()

  const canvasElement = document.getElementById('canvas')
  const game = new Game(spriteManager, canvasElement)
  game.loop()
}

main()
