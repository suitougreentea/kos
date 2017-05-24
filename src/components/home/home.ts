import Vue from 'vue'
import Component from 'vue-class-component'

import Game from "../../game"
import Renderer from "../../renderer"

@Component({
    template: require('./home.html')
})
export class HomeComponent extends Vue {
  game: Game = new Game()
  renderer: Renderer = new Renderer()
  public data = null

  mounted() {
    window.addEventListener("keydown", this.onKeyDown)
  }

  onKeyDown(e) {
    switch(e.code) {
      case "ArrowLeft":
        e.preventDefault()
        this.game.leftKeyPressed()
        this.refreshRenderer()
        break
      case "ArrowRight":
        e.preventDefault()
        this.game.rightKeyPressed()
        this.refreshRenderer()
        break
      case "ArrowDown":
        e.preventDefault()
        this.game.downKeyPressed()
        this.refreshRenderer()
        break
      case "ArrowUp":
        e.preventDefault()
        this.game.lockKeyPressed()
        this.refreshRenderer()
        break
      case "Space":
        e.preventDefault()
        this.game.quickKeyPressed()
        this.refreshRenderer()
        break
      case "KeyZ":
        e.preventDefault()
        this.game.ccwKeyPressed()
        this.refreshRenderer()
        break
      case "KeyX":
        e.preventDefault()
        this.game.cwKeyPressed()
        this.refreshRenderer()
        break
      case "KeyS":
        e.preventDefault()
        this.game.rotate180KeyPressed()
        this.refreshRenderer()
        break
      case "KeyC":
        e.preventDefault()
        this.game.holdKeyPressed()
        this.refreshRenderer()
        break
      case "KeyQ":
        e.preventDefault()
        this.game.resetKeyPressed()
        this.refreshRenderer()
        break
      case "KeyR":
        e.preventDefault()
        this.game.revertKeyPressed()
        this.refreshRenderer()
        break
      case "Enter":
        e.preventDefault()
        this.game.commitKeyPressed()
        this.refreshRenderer()
        break
    }
  }

  refreshRenderer() {
    this.data = this.renderer.render(this.game)
  }

  constructor() {
    super()
    this.data = this.renderer.render(this.game)
  }
}
