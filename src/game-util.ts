import Pos from "./pos"
import Field from "./field"
import { Mino } from "./mino"

export default class GameUtil {
  static hitTestMino(field: Field, mino: Mino, x: number, y: number, r: number): Boolean {
    const blocks = mino.getRotatedBlocks(r)
    return blocks.some(e => {
      const dx = x + e[0].x
      const dy = y + e[0].y
      return (dx < 0 || field.width <= dx || dy < 0 || field.height <= dy || field.contains(new Pos(dx, dy)))
    })
  }
}
