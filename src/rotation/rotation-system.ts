import Field from "../field"
import Pos from "../pos"
import { Mino } from "../Mino"
import GameUtil from "../game-util"

export interface RotationSystem {
  attempt(field: Field, mino: Mino, x: number, y: number, r: number, dr: number): RotationResult
}

export class RotationResult {
  constructor(readonly success: boolean, readonly offset: Pos, readonly kicked: boolean) {}
}

export class RotationSystemStandard implements RotationSystem {
  // 0->R, R->X, X->L, L->0
  readonly superOffset3x2CW = [
          [new Pos(0, 0), new Pos(-1, 0), new Pos(-1, 1), new Pos(0, -2), new Pos(-1, -2)],
          [new Pos(0, 0), new Pos(1, 0), new Pos(1, -1), new Pos(0, 2), new Pos(1, 2)],
          [new Pos(0, 0), new Pos(1, 0), new Pos(1, 1), new Pos(0, -2), new Pos(1, -2)],
          [new Pos(0, 0), new Pos(-1, 0), new Pos(-1, -1), new Pos(0, 2), new Pos(-1, 2)]
  ]
  readonly superOffset4ICW = [
          [new Pos(0, 0), new Pos(-2, 0), new Pos(1, 0), new Pos(-2, -1), new Pos(1, 2)],
          [new Pos(0, 0), new Pos(-1, 0), new Pos(2, 0), new Pos(-1, 2), new Pos(2, -1)],
          [new Pos(0, 0), new Pos(2, 0), new Pos(-1, 0), new Pos(2, 1), new Pos(-1, -2)],
          [new Pos(0, 0), new Pos(1, 0), new Pos(-2, 0), new Pos(1, -2), new Pos(-2, 1)]
  ]

  // 0->L, R->0, X->R, L->X
  readonly superOffset3x2CCW = [
          [new Pos(0, 0), new Pos(1, 0), new Pos(1, 1), new Pos(0, -2), new Pos(1, -2)],
          [new Pos(0, 0), new Pos(1, 0), new Pos(1, -1), new Pos(0, 2), new Pos(1, 2)],
          [new Pos(0, 0), new Pos(-1, 0), new Pos(-1, 1), new Pos(0, -2), new Pos(-1, -2)],
          [new Pos(0, 0), new Pos(-1, 0), new Pos(-1, -1), new Pos(0, 2), new Pos(-1, 2)]
  ]
  readonly superOffset4ICCW = [
          [new Pos(0, 0), new Pos(-1, 0), new Pos(2, 0), new Pos(-1, 2), new Pos(2, -1)],
          [new Pos(0, 0), new Pos(2, 0), new Pos(-1, 0), new Pos(2, 1), new Pos(-1, -2)],
          [new Pos(0, 0), new Pos(1, 0), new Pos(-2, 0), new Pos(1, -2), new Pos(-2, 1)],
          [new Pos(0, 0), new Pos(-2, 0), new Pos(1, 0), new Pos(-2, -1), new Pos(1, 2)]
  ]

  // 0->X, R->L, X->0, L->R
  readonly superOffset3x2180 = [
          [new Pos(0, 0), new Pos(1, 0), new Pos(-1, 0), new Pos(0, 1), new Pos(0, -1), new Pos(0, 2), new Pos(0, -2)],
          [new Pos(0, 0), new Pos(0, -1), new Pos(0, 1), new Pos(0, 2), new Pos(0, -2), new Pos(-1, 0), new Pos(1, 0)],
          [new Pos(0, 0), new Pos(-1, 0), new Pos(1, 0), new Pos(0, -1), new Pos(0, 1), new Pos(0, -2), new Pos(0, 2)],
          [new Pos(0, 0), new Pos(0, -1), new Pos(0, 1), new Pos(0, 2), new Pos(0, -2), new Pos(1, 0), new Pos(-1, 0)]
  ]
  readonly superOffset4I180 = [
          [new Pos(0, 0), new Pos(-1, 0), new Pos(-2, 0), new Pos(1, 0), new Pos(2, 0)],
          [new Pos(0, 0), new Pos(0, -1), new Pos(0, 1), new Pos(0, 2), new Pos(0, -2)],
          [new Pos(0, 0), new Pos(1, 0), new Pos(2, 0), new Pos(-1, 0), new Pos(-2, 0)],
          [new Pos(0, 0), new Pos(0, -1), new Pos(0, 1), new Pos(0, 2), new Pos(0, -2)]
  ]

  attempt(field: Field, mino: Mino, x: number, y: number, r: number, dr: number): RotationResult {
    const newR = (r + dr + 4) % 4
    let offset: Array<Array<Pos>>
    if(mino.minoId == 0) {
      offset = (
        dr == 1  ? this.superOffset4ICW :
        dr == -1 ? this.superOffset4ICCW :
        dr == 2 ? this.superOffset4I180 : null
      )
    } else {
      offset = (
        dr == 1  ? this.superOffset3x2CW :
        dr == -1 ? this.superOffset3x2CCW :
        dr == 2 ? this.superOffset3x2180 : null
      )
    }
    for(let i=0;i<offset[r].length;i++) {
      const o = offset[r][i]
      const dx = o.x
      const dy = o.y
      if(!GameUtil.hitTestMino(field, mino, x + dx, y + dy, newR)) {
        return new RotationResult(true, o, i != 0)
      }
    }
    return new RotationResult(false, new Pos(0, 0), false)
  }
}
