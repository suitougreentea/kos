import Block from "./block"
import { Mino, minoList } from "./mino"
import { MinoRandomizer } from "./randomizer/randomizer"
import { MinoColoring } from "./coloring/coloring"
import Pos from "./pos"

export interface MinoGenerator {
  newMino(): Mino
}

export class MinoGeneratorStandard {
  constructor(readonly minoRandomizer: MinoRandomizer, readonly minoColoring: MinoColoring) {}
  newMino(): Mino {
    const minoId = this.minoRandomizer.next()
    const colorId = this.minoColoring.getMinoColor(minoId)
    const blockPositions = minoList[minoId].positions

    const blocks = blockPositions.map<[Pos, Block]>((pos) => [pos, this.minoColoring.getMinoColor(minoId)] )
    return new Mino(minoId, blocks)
  }
}
