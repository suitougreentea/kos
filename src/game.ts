import Player from "./player"
import { minoName } from "./mino"

const linesName = {
  1: "Single",
  2: "Double",
  3: "Triple",
  4: "Quadruple"
}

const attack = {
  1: 0,
  2: 1,
  3: 2,
  4: 4
}
const spinAttack = {
  1: 2,
  2: 4,
  3: 6
}
const spinMiniAttack = {
  1: 0,
  2: 3
}

export default class Game {
  readonly seed = Math.floor(Math.random() * 1000000000)
  readonly players = [
    new Player(this, this.seed),
    new Player(this, this.seed),
    new Player(this, this.seed),
    new Player(this, this.seed),
  ]
  readonly alivePlayers: Array<number> = []
  public currentPlayer = 0

  constructor() {
    this.players.forEach((player, i) => {
      this.alivePlayers.push(i)
    })
    this.startPlayer()
  }

  leftKeyPressed() {
    this.players[this.currentPlayer].moveMino(-1)
  }
  rightKeyPressed() {
    this.players[this.currentPlayer].moveMino(1)
  }
  downKeyPressed() {
    this.players[this.currentPlayer].moveDown()
  }
  quickKeyPressed() {
    this.players[this.currentPlayer].moveDownQuick()
  }
  lockKeyPressed() {
    this.players[this.currentPlayer].lockMino()
  }
  cwKeyPressed() {
    this.players[this.currentPlayer].rotateMino(1)
  }
  ccwKeyPressed() {
    this.players[this.currentPlayer].rotateMino(-1)
  }
  rotate180KeyPressed() {
    this.players[this.currentPlayer].rotateMino(2)
  }
  holdKeyPressed() {
    this.players[this.currentPlayer].holdMino()
  }
  resetKeyPressed() {
    this.players[this.currentPlayer].resetMinoState()
  }
  revertKeyPressed() {
    this.players[this.currentPlayer].revert()
    this.players.forEach(player => player.revertGarbage())
  }
  commitKeyPressed() {
    this.players[this.currentPlayer].commit()
    this.players.forEach(player => player.saveGarbage())
  }

  onLineErase(minoId: number, lines: number, spin: boolean, spinMini: boolean, backToBack: boolean, combo: number, allClear: boolean) {
    let attack = this.calculateAttack(minoId, lines, spin, spinMini, backToBack, combo, allClear)
    if(attack > 0) {
      let actualAttack = 0
      const garbage = this.players[this.currentPlayer].garbage
      while(attack > 0) {
        if(garbage.length > 0) {
          garbage[0] --
          if(garbage[0] == 0) garbage.shift()
        } else {
          actualAttack ++
        }
        attack --
      }

      if(actualAttack > 0) {
        const target = this.players[this.currentPlayer].target
        this.players[target].garbage.push(actualAttack)
      }
    }
    const c = []
    if(backToBack) c.push("Back to Back")
    if(spin) c.push(`${minoName[minoId]}-Spin`)
    if(spinMini) c.push("Mini")
    c.push(linesName[lines])
    if(combo >= 1) c.push(`${combo} Combo`)
    if(allClear) c.push("All Clear")
    console.log("Player" + (this.currentPlayer + 1) + ": " + c.join(" "))
  }

  onTurnEnd() {
    this.nextPlayer()
  }

  onGameOver() {
    console.log("Player" + (this.currentPlayer + 1) + ": Lose")
    this.players[this.currentPlayer].alive = false
    this.alivePlayers.splice(this.alivePlayers.indexOf(this.currentPlayer), 1)
    if(this.alivePlayers.length == 1) {
      console.log("Player " + (this.alivePlayers[0] + 1) + ": Win")
    }
    this.nextPlayer()
  }

  calculateAttack(minoId: number, lines: number, spin: boolean, spinMini: boolean, backToBack: boolean, combo: number, allClear: boolean): number {
    let result = 0
    if(spin && spinMini) result += spinMiniAttack[lines]
    else if(spin) result += spinAttack[lines]
    else result += attack[lines]
    if(backToBack) result ++
    if(combo) result += this.calculateComboAttack(combo)
    if(allClear) result += 6
    return result
  }

  calculateComboAttack(combo: number): number {
    return Math.min(Math.floor(combo / 2), 5)
  }

  nextPlayer() {
    this.currentPlayer = this.findNextPlayer(this.currentPlayer, -1)
    this.startPlayer()
  }

  startPlayer() {
    const current = this.players[this.currentPlayer]
    current.target = this.findNextPlayer(current.target == null ? this.currentPlayer : current.target, this.currentPlayer)
    current.startTurn()
  }

  findNextPlayer(current, exclude): number {
    const start = (current + 1) % this.players.length
    if(this.alivePlayers.indexOf(start) >= 0 && start != exclude) return start
    let i = (start + 1) % this.players.length
    while(i != start) {
      if(this.alivePlayers.indexOf(i) >= 0 && i != exclude) return i
      i = (i + 1) % this.players.length
    }
    return -1
  }
}
