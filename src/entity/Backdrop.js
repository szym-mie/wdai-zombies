import Entity from '../Entity'
import Position from '../Position'

class Backdrop extends Entity {
  /**
   * @constructor
   * @param {Sprite} sprite sprite to draw
   */
  constructor (sprite) {
    super(new Position())
    this.sprite = sprite
  }

  render (renderer) {
    const transform = renderer.withTransform()
      .fitHeight(this.sprite, 0)
    renderer.drawSprite(this.sprite, 0, transform)
  }
}

export default Backdrop
