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
    const damp = Math.max((1 - this.shotFiredAnimationTime / PlayerStatus.shotShakeTimeDuration), 0)
    return new Position(
      Math.sin(this.shotFiredAnimationTime) * damp * PlayerStatus.shotShakeScale,
      Math.cos(this.shotFiredAnimationTime) * damp * PlayerStatus.shotShakeScale
    )
  }

  getHeartLostPositionShake (index) {
    const time = Math.max(this.heartLostAnimationTime - index * PlayerStatus.heartShakeTimeIncrement, 0)
    const timePi = Math.min(time / PlayerStatus.heartShakeTimeDuration, 1) * Math.PI
    return new Position(0, Math.sin(timePi) ** 4 * -PlayerStatus.heartShakeScale)
  }

  update (deltaTime) {
    super.update(deltaTime)
    this.heartLostAnimationTime += deltaTime
    this.shotFiredAnimationTime += deltaTime
  }

  render (renderer) {
    const shotShakePosition = this.getShotFiredPositionShake()

    const lives = this.game.lives
    const heartPosition = renderer.fromViewportCoordToAbsolute(PlayerStatus.heartPositionStart)
    for (let i = 0; i < PlayerStatus.heartCount; i++) {
      const transform = renderer.withTransform()
        .positionOf(this.getHeartLostPositionShake(lives - i).add(heartPosition).add(shotShakePosition))
        .scaleOf(PlayerStatus.heartScale)
      renderer.drawSprite(
        this.heartSprite,
        i < lives ? PlayerStatus.fullHeartFrame : PlayerStatus.lostHeartFrame,
        transform
      )
      heartPosition.add(new Position(PlayerStatus.heartPositionIncrement, 0))
    }

    const score = this.game.score.toString().padStart(6, '0')
    const scorePosition = renderer.fromViewportCoordToAbsolute(PlayerStatus.scorePosition)
    const transform = renderer.withTransform()
      .positionOf(scorePosition.add(shotShakePosition))
    renderer.drawText(score, '#fff', this.fontName, this.fontSize, transform)
  }

  static heartCount = 3
  static fullHeartFrame = 0
  static lostHeartFrame = 1
  static heartPositionStart = new Position(-0.8, -0.85)
  static heartScale = 1
  static heartPositionIncrement = 100
  static heartShakeScale = 20
  static heartShakeTimeDuration = 300
  static heartShakeTimeIncrement = 100
  static shotShakeScale = 50
  static shotShakeTimeDuration = 200
  static scorePosition = new Position(0.7, -0.85)
}

export default PlayerStatus
