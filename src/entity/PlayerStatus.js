import Entity from '../Entity'
import Position from '../Position'

class PlayerStatus extends Entity {
  /**
   * @constructor
   * @param {Game} game game status to display
   * @param {Sprite} heartSprite heart sprite
   * @param {string} fontName font name
   * @param {number} fontSize font size
   */
  constructor (game, heartSprite, fontName, fontSize) {
    super(new Position())
    this.game = game
    this.heartSprite = heartSprite
    this.fontName = fontName
    this.fontSize = fontSize

    this.shotFiredAnimationTime = 0
    this.heartLostAnimationTime = 0
  }

  shotFired () {
    this.shotFiredAnimationTime = 0
  }

  lostHeart () {
    this.heartLostAnimationTime = 0
  }

  getShotFiredPositionShake () {

  }

  getHeartLostPositionShake (index) {
    const time = Math.max(this.heartLostAnimationTime - index * PlayerStatus.heartWobbleTimeIncrement, 0)
    const timePi = Math.min(time / PlayerStatus.heartWobbleTimeDuration, 1) * Math.PI
    return new Position(0, Math.sin(timePi) ** 4 * -PlayerStatus.heartWobbleScale)
  }

  update (deltaTime) {
    super.update(deltaTime)
    this.heartLostAnimationTime += deltaTime
    this.shotFiredAnimationTime += deltaTime
  }

  render (renderer) {
    const lives = this.game.lives
    const heartPosition = renderer.fromViewportCoordToAbsolute(PlayerStatus.heartPositionStart)
    for (let i = 0; i < PlayerStatus.heartCount; i++) {
      const transform = renderer.withTransform()
        .positionOf(this.getHeartLostPositionShake(lives - i).add(heartPosition))
        .scaleOf(PlayerStatus.heartScale)
      renderer.drawSprite(
        this.heartSprite,
        i < lives ? PlayerStatus.fullHeartFrame : PlayerStatus.lostHeartFrame,
        transform
      )
      heartPosition.add(new Position(PlayerStatus.heartPositionIncrement, 0))
    }
  }

  static heartCount = 3
  static fullHeartFrame = 0
  static lostHeartFrame = 1
  static heartPositionStart = new Position(-0.8, -0.85)
  static heartScale = 1
  static heartPositionIncrement = 100
  static heartWobbleScale = 20
  static heartWobbleTimeDuration = 300
  static heartWobbleTimeIncrement = 100
}

export default PlayerStatus
