import Block from "../block"

export interface MinoColoring {
  getMinoColor(minoId: number): Block
}

export class MinoColoringStandard implements MinoColoring {
  readonly color = [Block.Skyblue, Block.Blue, Block.Orange, Block.Yellow, Block.Green, Block.Purple, Block.Red]
  getMinoColor(minoId: number): Block {
    return this.color[minoId]
  }
}
