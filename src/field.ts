import Pos from "./pos"
import Block from "./block"

export default class Field {
  readonly map: Map<string, Block> = new Map()
  constructor(readonly width: number, readonly height: number) {}

  clear() { this.map.clear() }
  get(position: Pos): Block { return this.map.get(position.toString()) }
  set(position: Pos, block: Block) { this.map.set(position.toString(), block) }
  contains(position: Pos): boolean { return this.map.has(position.toString()) }
  isBlock(position: Pos): boolean { return (position.x < 0 || position.x >= this.width || position.y < 0 || position.y >= this.height || this.contains(position)) }
  remove(position: Pos) { this.map.delete(position.toString()) }
  clone(): Field {
    const result = new Field(this.width, this.height)
    this.map.forEach((block, pos) => result.map.set(pos, block))
    return result
  }
}
