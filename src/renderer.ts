import Player from "./player"
import Game from "./game"
import Block from "./block"
import Pos from "./pos"
import { MinoUtil } from "./mino"

const blockClassList = {
  [Block.Red]: "red",
  [Block.Orange]: "orange",
  [Block.Yellow]: "yellow",
  [Block.Green]: "green",
  [Block.Skyblue]: "skyblue",
  [Block.Blue]: "blue",
  [Block.Purple]: "purple",
  [Block.Gray]: "gray",
}

const nextOffset = [
  new Pos(0, 0), //I
  new Pos(0, 0),  //J
  new Pos(0, 0),  //L
  new Pos(1, 1),  //O
  new Pos(0, 0),  //S
  new Pos(0, 0),  //T
  new Pos(0, 0),  //I
]

export default class Renderer {
  renderPlayers(player: Player, i: number) {
    const field = []
    for(let iy=0; iy<player.viewHeight; iy++) {
      field[iy] = []
      for(let ix=0; ix<player.width; ix++) {
        const pos = new Pos(ix, player.viewHeight - iy - 1)
        let blockClass: string
        if(player.field.contains(pos)) blockClass = blockClassList[player.field.get(pos)]
        else blockClass = "none"
        field[iy][ix] = {
          blockClass: blockClass
        }
      }
    }

    if(player.currentMino != null) {
      player.currentMino.getRotatedBlocks(player.minoR).forEach(e => {
        const x = e[0].x + player.minoX
        const y = e[0].y + player.ghostY
        if(player.viewHeight - y - 1 >= 0) field[player.viewHeight - y - 1][x].blockClass = blockClassList[e[1]] + "-ghost"
      })
      player.currentMino.getRotatedBlocks(player.minoR).forEach(e => {
        const x = e[0].x + player.minoX
        const y = e[0].y + player.minoY
        if(player.viewHeight - y - 1 >= 0) field[player.viewHeight - y - 1][x].blockClass = blockClassList[e[1]] + "-active"
      })
    }

    const next = []
    const nextSize = player.turnMinoNumber
    for(let iy=0; iy<1 + nextSize * 3; iy++) {
      next[iy] = []
      for(let ix=0; ix<4; ix++) {
        next[iy][ix] = {
          blockClass: "none"
        }
      }
    }
    player.next.forEach((e, i) => {
      const offset = nextOffset[e.minoId]
      e.blocks.forEach(f => {
        const x = f[0].x + offset.x
        const y = f[0].y + offset.y
        next[i * 3 + 3 - y][x].blockClass = blockClassList[f[1]]
      })
    })

    const hold = []
    for(let iy=0; iy<4; iy++) {
      hold[iy] = []
      for(let ix=0; ix<4; ix++) {
        hold[iy][ix] = {
          blockClass: "none"
        }
      }
    }
    if(player.hold != null) {
      const offset = nextOffset[player.hold.minoId]
      player.hold.blocks.forEach(e => {
        const x = e[0].x + offset.x
        const y = e[0].y + offset.y
        hold[3-y][x].blockClass = blockClassList[e[1]]
      })
    }

    const garbage = "[" + player.garbage.reduce((a, b) => a + b, 0) + "] " + player.garbage.join(", ")
    const combo = Math.max(player.combo, 0)

    return {
      number: i + 1,
      alive: player.alive,
      gameOver: player.gameOver,
      active: player.active,
      field: field,
      next: next,
      hold: hold,
      garbage: garbage,
      combo: combo,
      backToBack: player.backToBackFlag,
      target: player.target == null ? "-" : player.target + 1,
      mino: player.placedMinoNumber + "/" + player.turnMinoNumber
    }
  }

  render(game: Game) {
    return {
      players: game.players.map((e, i) => this.renderPlayers(e, i))
    }
  }
}
