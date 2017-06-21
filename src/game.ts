import Player from "./player"
import { minoName } from "./mino"
import { KeyConfig, KeyState } from "./key-config"

export enum GarbageMode {
  ALL,
  ONE_ATTACK
}

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
  readonly players: Array<Player>
  readonly alivePlayers: Array<number> = []
  public currentPlayer = 0

  constructor() {
    const player1Config = this.getDefaultPlayerSetting()
    const player1 = new Player(this, this.seed, player1Config)
    const player2Config = this.getDefaultPlayerSetting()
    player2Config.keyConfig = new KeyConfig("ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "", "KeyA", "KeyD", "KeyS", "Space", "", "KeyR", "Enter")
    const player2 = new Player(this, this.seed + 1, player2Config)

    this.players = [player1, player2]
    this.players.forEach((player, i) => {
      this.alivePlayers.push(i)
    })
    this.startPlayer()
  }

  getDefaultPlayerSetting() {
    return {
      keyConfig: new KeyConfig("ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Space", "KeyZ", "KeyX", "KeyS", "KeyC", "KeyQ", "KeyR", "Enter"),
      width: 10,
      height: 25,
      viewHeight: 25,
      turnMinoNumber: 7,
      garbageMode: GarbageMode.ALL,
    }
  }

  onKeyDown(e: KeyboardEvent) {
    this.players[this.currentPlayer].keyConfig.onKeyDown(e)
  }

  onKeyUp(e: KeyboardEvent) {
    this.players[this.currentPlayer].keyConfig.onKeyUp(e)
  }

  update(): boolean {
    let needsRefresh = false
    const currentPlayer = this.players[this.currentPlayer]
    currentPlayer.keyConfig.update()
    const keyState = currentPlayer.keyConfig.frameState

    if(keyState.get("left") == KeyState.JUST_PRESSED) {
      currentPlayer.moveMinoJustPressed(-1)
      needsRefresh = true
    }

    if(keyState.get("left") == KeyState.PRESSED) {
      needsRefresh = needsRefresh || currentPlayer.moveMinoPressed(-1)
    }

    if(keyState.get("right") == KeyState.JUST_PRESSED) {
      currentPlayer.moveMinoJustPressed(1)
      needsRefresh = true
    }

    if(keyState.get("right") == KeyState.PRESSED) {
      needsRefresh = needsRefresh || currentPlayer.moveMinoPressed(1)
    }

    if(keyState.get("down") == KeyState.JUST_PRESSED || keyState.get("down") == KeyState.PRESSED) {
      needsRefresh = needsRefresh || currentPlayer.moveDownPressed()
    }

    if(keyState.get("down") == KeyState.JUST_RELEASED) {
      currentPlayer.moveDownReleased()
    }

    if(keyState.get("lock") == KeyState.JUST_PRESSED) {
      currentPlayer.lockMino()
      needsRefresh = true
    }

    if(keyState.get("quick") == KeyState.JUST_PRESSED) {
      currentPlayer.moveDownQuick()
      needsRefresh = true
    }

    if(keyState.get("ccw") == KeyState.JUST_PRESSED) {
      currentPlayer.rotateMino(-1)
      needsRefresh = true
    }

    if(keyState.get("cw") == KeyState.JUST_PRESSED) {
      currentPlayer.rotateMino(1)
      needsRefresh = true
    }

    if(keyState.get("rotate180") == KeyState.JUST_PRESSED) {
      currentPlayer.rotateMino(2)
      needsRefresh = true
    }

    if(keyState.get("hold") == KeyState.JUST_PRESSED) {
      currentPlayer.holdMino()
      needsRefresh = true
    }

    if(keyState.get("reset") == KeyState.JUST_PRESSED) {
      currentPlayer.resetMinoState()
      needsRefresh = true
    }

    if(keyState.get("revert") == KeyState.JUST_PRESSED) {
      currentPlayer.revert()
      this.players.forEach(player => player.revertGarbage())
      needsRefresh = true
    }

    if(keyState.get("commit") == KeyState.JUST_PRESSED) {
      currentPlayer.commit()
      this.players.forEach(player => player.saveGarbage())
      needsRefresh = true
    }

    return needsRefresh
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
    this.players[this.currentPlayer].keyConfig.reset()
    this.nextPlayer()
  }

  onGameOver() {
    console.log("Player" + (this.currentPlayer + 1) + ": Lose")
    this.players[this.currentPlayer].alive = false
    this.alivePlayers.splice(this.alivePlayers.indexOf(this.currentPlayer), 1)
    if(this.alivePlayers.length == 1) {
      this.players[this.alivePlayers[0]].viewHeight = this.players[this.alivePlayers[0]].height
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
