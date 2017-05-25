import Field from "./field"
import { Mino, MinoUtil, minoList } from "./mino"
import { MinoRandomizer, MinoRandomizerBag } from "./randomizer/randomizer"
import { MinoColoring, MinoColoringStandard } from "./coloring/coloring"
import { MinoGenerator, MinoGeneratorStandard } from "./mino-generator"
import { RotationSystem, RotationSystemStandard } from "./rotation/rotation-system"
import Block from "./block"
import Pos from "./pos"
import GameUtil from "./game-util"
import Game from "./game"

const spinDataHigh = [
  [],
  [new Pos(1, 2), new Pos(2, 2)], // J
  [new Pos(0, 2), new Pos(1, 2)], // L
  [], // O
  [new Pos(0, 2), new Pos(2, 1)], // S
  [new Pos(0, 2), new Pos(2, 2)], // T
  [new Pos(0, 1), new Pos(2, 2)], // Z
]

const spinDataHighI = [[new Pos(1, 3), new Pos(2, 1)], [new Pos(1, 1), new Pos(2, 3)]]

const spinDataLow = [
  [new Pos(-1, 2), new Pos(4, 2)],
  [new Pos(0, 0), new Pos(2, 0)], // J
  [new Pos(0, 0), new Pos(2, 0)], // L
  [], // O
  [new Pos(-1, 1), new Pos(3, 2)], // S
  [new Pos(0, 0), new Pos(2, 0)], // T
  [new Pos(-1, 2), new Pos(3, 1)], // Z
]

export default class Player {
  public field = new Field(10, 25)
  readonly width = this.field.width
  readonly height = this.field.height
  public viewHeight = 20

  readonly randomizer: MinoRandomizer
  readonly coloring: MinoColoring
  readonly generator: MinoGenerator
  readonly rotationSystem: RotationSystem

  readonly turnMinoNumber = 7
  public currentMino: Mino
  public minoX: number = 0
  public minoY: number = 0
  public minoR: number = 0
  public ghostY: number = 0
  public next: Array<Mino> = []
  public hold: Mino = null
  public placedMinoNumber: number = 0
  public garbage: Array<number> = []
  public invisibleGarbage: Array<number> = []

  public lastStartMino: Mino
  public lastField: Field = new Field(10, 25)
  public lastNext: Array<Mino> = []
  public lastHold: Mino
  public lastPlacedMinoNumber: number = 0
  public lastGarbage: Array<number> = []

  public lastRotated = false
  public lastKicked = false

  public combo = -1
  public backToBackFlag = false

  public alive = true
  public active = false
  public target: number

  constructor(readonly game: Game, seed: number) {
    this.randomizer = new MinoRandomizerBag(new Set([0, 1, 2, 3, 4, 5, 6]), seed)
    this.coloring = new MinoColoringStandard()
    this.generator = new MinoGeneratorStandard(this.randomizer, this.coloring)
    this.rotationSystem = new RotationSystemStandard()
    this.currentMino = this.generator.newMino()
    this.resetMinoState()
    this.commit()
    this.next.push(this.generator.newMino())
  }

  startTurn() {
    this.placedMinoNumber = 0
    this.lastPlacedMinoNumber = 0
    this.active = true
    if(this.currentMino == null) {
      this.newMino()
    }
    this.lastStartMino = this.currentMino
  }

  newMino() {
    this.currentMino = this.next.shift()
    this.resetMinoState()
  }

  resetMinoState() {
    if(this.currentMino == null) return
    this.minoR = 0
    const spawnPosition = this.getSpawnPosition(this.currentMino.minoId, this.minoR)
    this.minoX = spawnPosition.x
    this.minoY = spawnPosition.y
    if(GameUtil.hitTestMino(this.field, this.currentMino, this.minoX, this.minoY, this.minoR)) {
      this.viewHeight = this.height
      this.game.onGameOver()
    }
    this.lastRotated = false
    this.lastKicked = false
    this.refreshGhost()
  }

  refreshGhost() {
    if(this.currentMino == null) return
    this.ghostY = this.minoY
    while(!GameUtil.hitTestMino(this.field, this.currentMino, this.minoX, this.ghostY - 1, this.minoR)) this.ghostY --
  }

  moveMino(dx: number) {
    if(this.currentMino == null) return
    if(!GameUtil.hitTestMino(this.field, this.currentMino, this.minoX + dx, this.minoY, this.minoR)) {
      this.minoX += dx
      this.lastRotated = false
      this.refreshGhost()
      return true
    }
    return false
  }

  moveDown() {
    if(this.currentMino == null) return
    if(!GameUtil.hitTestMino(this.field, this.currentMino, this.minoX, this.minoY - 1, this.minoR)) {
      this.minoY --
      this.lastRotated = false
      return true
    }
    return false
  }

  moveDownQuick() {
    if(this.currentMino == null) return
    if(this.minoY != this.ghostY) this.lastRotated = false
    this.minoY = this.ghostY
  }

  rotateMino(dr: number): boolean {
    if(this.currentMino == null) return
    const mino = this.currentMino
    if(mino == null) return false
    const result = this.rotationSystem.attempt(this.field, mino, this.minoX, this.minoY, this.minoR, dr)
    if(result.success) {
      this.minoX += result.offset.x
      this.minoY += result.offset.y
      this.minoR = (this.minoR + 4 + dr) % 4
      this.lastKicked = result.kicked
      this.lastRotated = true
      this.refreshGhost()
      return true
    } else {
      return false
    }
  }

  lockMino() {
    if(this.currentMino == null) return
    if(this.minoY != this.ghostY) this.lastRotated = false
    this.minoY = this.ghostY
    this.currentMino.getRotatedBlocks(this.minoR).forEach(e => {
      const pos = e[0]
      const block = e[1]
      this.field.set(new Pos(this.minoX + pos.x, this.minoY + pos.y), block)
    })

    let spin = false
    let spinMini = false
    if(this.lastRotated) {
      const minoId = this.currentMino.minoId
      const minoSize = minoList[minoId].size
      if(this.currentMino.minoId == 3) { /* O */ }
      if(this.currentMino.minoId == 0) {
        // I
        const high = spinDataHighI.map(e => e.map(pos => MinoUtil.getRotatedCoordinate(pos, this.minoR, minoSize)))
        const low = spinDataLow[minoId].map(pos => MinoUtil.getRotatedCoordinate(pos, this.minoR, minoSize))
        const high00 = this.field.isBlock(new Pos(this.minoX + high[0][0].x, this.minoY + high[0][0].y))
        const high01 = this.field.isBlock(new Pos(this.minoX + high[0][1].x, this.minoY + high[0][1].y))
        const high10 = this.field.isBlock(new Pos(this.minoX + high[1][0].x, this.minoY + high[1][0].y))
        const high11 = this.field.isBlock(new Pos(this.minoX + high[1][1].x, this.minoY + high[1][1].y))
        const low0 = this.field.isBlock(new Pos(this.minoX + low[0].x, this.minoY + low[0].y))
        const low1 = this.field.isBlock(new Pos(this.minoX + low[1].x, this.minoY + low[1].y))
        if(((high00 && high01) || (high10 && high11)) && (low0 || low1)) {
          spin = true
        } else if((high00 || high01 || high10 || high11) && low0 && low1) {
          spin = true
          spinMini = true
        }
      } else {
        // Others
        const high = spinDataHigh[minoId].map(pos => MinoUtil.getRotatedCoordinate(pos, this.minoR, minoSize))
        const low = spinDataLow[minoId].map(pos => MinoUtil.getRotatedCoordinate(pos, this.minoR, minoSize))
        const high0 = this.field.isBlock(new Pos(this.minoX + high[0].x, this.minoY + high[0].y))
        const high1 = this.field.isBlock(new Pos(this.minoX + high[1].x, this.minoY + high[1].y))
        const low0 = this.field.isBlock(new Pos(this.minoX + low[0].x, this.minoY + low[0].y))
        const low1 = this.field.isBlock(new Pos(this.minoX + low[1].x, this.minoY + low[1].y))
        if(high0 && high1 && (low0 || low1)) {
          spin = true
        } else if((high0 || high1) && low0 && low1) {
          spin = true
          spinMini = true
        }
      }
    }

    const fillStart = this.invisibleGarbage.reduce((a, b) => a + b, 0)
    const lineFilled = []
    for(let iy=fillStart; iy<this.height; iy++) {
      lineFilled[iy] = true
      for(let ix=0; ix<this.width; ix++) {
        if(!this.field.contains(new Pos(ix, iy))) lineFilled[iy] = false
      }
    }

    const lines = lineFilled.filter(e => e).length
    if(lines > 0) this.combo ++
    else this.combo = -1
    let i = 0
    while(i < this.height) {
      const e = lineFilled[i]
      if(e) {
        for(let ix=0; ix<this.width; ix++) this.field.remove(new Pos(ix, i))
        for(let iy=i+1; iy<this.height; iy++) {
          for(let ix=0; ix<this.width; ix++) {
            if(this.field.contains(new Pos(ix, iy))) {
              this.field.set(new Pos(ix, iy-1), this.field.get(new Pos(ix, iy)))
              this.field.remove(new Pos(ix, iy))
            }
          }
          lineFilled[iy-1] = lineFilled[iy]
          lineFilled[iy] = false
        }
      } else i++
    }


    if(lines > 0) {
      const allClear = this.field.map.size == 0
      const backToBack = this.backToBackFlag && (lines == 4 || spin)
      this.game.onLineErase(this.currentMino.minoId, lines, spin, spinMini, backToBack, this.combo, allClear)
      this.backToBackFlag = lines == 4 || spin
    }

    if(lines == 0) {
      while(this.garbage.length > 0) {
        const garbageLines = this.garbage.shift()
        this.invisibleGarbage.push(garbageLines)
        for(let iy=this.height-1; iy>=garbageLines; iy--) {
          for(let ix=0; ix<this.width; ix++) {
            if(this.field.contains(new Pos(ix, iy - garbageLines))) {
              this.field.set(new Pos(ix, iy), this.field.get(new Pos(ix, iy - garbageLines)))
              this.field.remove(new Pos(ix, iy - garbageLines))
            }
          }
        }
        for(let iy=garbageLines-1; iy>=0; iy--) {
          for(let ix=0; ix<this.width; ix++) {
            this.field.set(new Pos(ix, iy), Block.Gray)
          }
        }
      }
    }

    this.placedMinoNumber ++
    if(this.placedMinoNumber < this.turnMinoNumber) {
      this.newMino()
    } else {
      this.currentMino = null
    }
  }

  holdMino() {
    if(this.currentMino == null) return
    if(this.hold == null) {
      this.hold = this.currentMino
      this.currentMino = this.next.shift()
    } else {
      const swap = this.hold
      this.hold = this.currentMino
      this.currentMino = swap
    }
    this.resetMinoState()
  }

  commit() {
    if(this.invisibleGarbage.length > 0) {
      let iy = this.invisibleGarbage.reduce((a, b) => a + b, 0) - 1
      this.invisibleGarbage.forEach(lines => {
        const holePosition = Math.floor(Math.random() * this.width)
        for(let jy=0; jy<lines; jy++) {
          this.field.remove(new Pos(holePosition, iy))
          iy--
        }
      })
      this.invisibleGarbage = []
    }
    while(this.next.length < this.turnMinoNumber - 1) this.next.push(this.generator.newMino())
    this.lastStartMino = this.currentMino
    this.lastField = this.field.clone()
    this.lastNext = []
    this.next.forEach(e => this.lastNext.push(e))
    this.lastHold = this.hold
    this.lastPlacedMinoNumber = this.placedMinoNumber
    if(this.turnMinoNumber == this.placedMinoNumber) {
      this.next.push(this.generator.newMino())
      this.active = false
      this.game.onTurnEnd()
    }
  }

  revert() {
    this.currentMino = this.lastStartMino
    this.field = this.lastField
    this.next = this.lastNext
    this.hold = this.lastHold
    this.placedMinoNumber = this.lastPlacedMinoNumber
    this.invisibleGarbage = []
    this.commit()
    this.resetMinoState()
  }

  saveGarbage() {
    this.lastGarbage = []
    this.garbage.forEach(e => this.lastGarbage.push(e))
  }

  revertGarbage() {
    this.garbage = this.lastGarbage
    this.saveGarbage()
  }

  getSpawnPosition(minoId: number, r: number): Pos {
    const rect = MinoUtil.getRotatedRectangle(minoId, r)
    const s = rect[0]
    const e = rect[1]
    const x = Math.floor((this.width - (e.x - s.x + 1)) / 2)
    const y = this.height - minoList[minoId].size
    return new Pos(x, y)
  }
}
