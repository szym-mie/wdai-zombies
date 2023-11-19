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
    this.screenCardAnimationTime = 0

    this.screenCard = 'start'
  }

  shotFired () {
    this.shotFiredAnimationTime = 0
  }

  shakeHeart () {
    this.heartLostAnimationTime = 0
  }

  gameEnd () {
    this.screenCardAnimationTime = 0
    this.screenCardFadeOut = false
    this.screenCard = 'again'
  }

  gameStart () {
    this.screenCardAnimationTime = 0
    this.screenCardFadeOut = true
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

  getScreenCardTextPosition () {
    const verticalPosition = Math.cos(Entity.getUnitTime(this.screenCardAnimationTime) * Math.PI)
    return new Position(
      0,
      verticalPosition * PlayerStatus.screenCardFlyPositionScale
    )
  }

  getScreenCardTextRotation () {
    const rotation = Math.sin(Entity.getUnitTime(this.totalTime) * Math.PI)
    return rotation * PlayerStatus.screenCardFlyRotationScale
  }

  getScreenCardLayerOffset () {
    const rotation = Entity.getUnitTime(this.totalTime)
    const scale = Math.cos(rotation * 2.5) * 0.5 + 1
    return new Position().setFromAngle(rotation).scale(scale * PlayerStatus.screenCardLayerOffsetScale)
  }

  getScreenCardLayerCount () {
    const relativeLayerCount = Math.min(
      Math.floor(Entity.getUnitTime(this.screenCardAnimationTime) * PlayerStatus.screenCardLayerHideSpeed),
      PlayerStatus.screenCardLayerCount
    )
    return this.screenCardFadeOut ? relativeLayerCount : PlayerStatus.screenCardLayerCount - relativeLayerCount
  }

  getScreenCardText () {
    return PlayerStatus.screenCardTextMap.get(this.screenCard)
  }

  update (deltaTime) {
    super.update(deltaTime)
    this.heartLostAnimationTime += deltaTime
    this.shotFiredAnimationTime += deltaTime
    this.screenCardAnimationTime += deltaTime
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
    const scoreLayerOffset = new Position(2, -2)
    this.drawLayeredText(renderer, score, scorePosition.add(shotShakePosition), 0, scoreLayerOffset)

    const screenCardPosition = this.getScreenCardTextPosition()
    const screenCardRotation = this.getScreenCardTextRotation()
    const screenCardLayerOffset = this.getScreenCardLayerOffset()

    this.drawLayeredText(
      renderer,
      this.getScreenCardText(),
      screenCardPosition,
      screenCardRotation,
      screenCardLayerOffset,
      this.getScreenCardLayerCount()
    )
  }

  drawLayeredText (renderer, text, position, rotation, offset, layerCount = 0) {
    const layerPosition = position.copy()

    for (let i = 0; i < PlayerStatus.screenCardLayerCount; i++) {
      const transform = renderer.withTransform()
        .positionOf(layerPosition)
        .rotationOf(rotation)
      const color = PlayerStatus.screenCardLayerColors[i - layerCount]
      if (i >= layerCount) renderer.drawText(text, color, this.fontName, this.fontSize, transform)
      layerPosition.add(offset)
    }
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

  static screenCardFlyPositionScale = 20
  static screenCardFlyRotationScale = 0.2
  static screenCardLayerOffsetScale = 1.5
  static screenCardLayerCount = 12
  static screenCardLayerHideSpeed = 24
  static screenCardLayerColors = ['#312C33', '#413047', '#693A7A', '#413047', '#693A7A', '#8C2FAD', '#693A7A', '#8C2FAD', '#A90FE0', '#8C2FAD', '#A90FE0', '#FFFFFF']

  static scorePosition = new Position(0.7, -0.85)

  static screenCardTextMap = new Map([
    ['start', 'Hit mouse button to start'],
    ['again', 'You\'re dead. Hit mouse button'],
    ['blank', '']
  ])
}

export default PlayerStatus
