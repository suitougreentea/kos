import Pos from "./pos"
import Block from "./block"

class MinoDefinition {
  constructor(readonly size: number, readonly positions: Array<Pos>) {}
}

export class Mino {
  readonly size: number
  constructor(readonly minoId: number, readonly blocks: Array<[Pos, Block]>) {
    this.size = minoList[minoId].size
  }

  getRotatedBlocks(rotation: number): Array<[Pos, Block]> {
    return this.blocks.map<[Pos, Block]>(e => [MinoUtil.getRotatedCoordinate(e[0], rotation, this.size), e[1]])
  }

  getRotatedRectangle(rotation: number): [Pos, Pos] {
    return MinoUtil.getRotatedRectangle(this.minoId, rotation)
  }
}

export class MinoUtil {
  static getRotatedCoordinate(coordinate: Pos, rotation: number, size: number): Pos {
    switch(rotation) {
      case 0: return new Pos(coordinate.x, coordinate.y)
      case 1: return new Pos(coordinate.y, size-1 - coordinate.x)
      case 2: return new Pos(size-1 - coordinate.x, size-1 - coordinate.y)
      case 3: return new Pos(size-1 - coordinate.y, coordinate.x)
    }
  }

  static getRotatedRectangle(minoId: number, rotation: number): [Pos, Pos] {
    const def = minoList[minoId]
    const size = def.size
    const coords = def.positions
    const blockCoords = coords.map(e => MinoUtil.getRotatedCoordinate(e, rotation, size))
    const xCoords = blockCoords.map(e => e.x)
    const yCoords = blockCoords.map(e => e.y)
    return [new Pos(Math.min(...xCoords), Math.min(...yCoords)), new Pos(Math.max(...xCoords), Math.max(...yCoords))]
  }
}

export const minoList = [
  new MinoDefinition(4, [new Pos(0, 2), new Pos(1, 2), new Pos(2, 2), new Pos(3, 2)]),  // I
  new MinoDefinition(3, [new Pos(0, 2), new Pos(0, 1), new Pos(1, 1), new Pos(2, 1)]),  // J
  new MinoDefinition(3, [new Pos(2, 2), new Pos(0, 1), new Pos(1, 1), new Pos(2, 1)]),  // L
  new MinoDefinition(2, [new Pos(0, 1), new Pos(1, 1), new Pos(0, 0), new Pos(1, 0)]),  // O
  new MinoDefinition(3, [new Pos(1, 2), new Pos(2, 2), new Pos(0, 1), new Pos(1, 1)]),  // S
  new MinoDefinition(3, [new Pos(1, 2), new Pos(0, 1), new Pos(1, 1), new Pos(2, 1)]),  // T
  new MinoDefinition(3, [new Pos(0, 2), new Pos(1, 2), new Pos(1, 1), new Pos(2, 1)]),  // Z
]

export const minoName = ["I", "J", "L", "O", "S", "T", "Z"]
