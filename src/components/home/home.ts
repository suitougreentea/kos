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
    window.addEventListener("keyup", this.onKeyUp)
    window.setInterval(this.update, 1000 / 30)
  }

  update() {
    if(this.game.update()) this.refreshRenderer()
  }

  onKeyDown(e: KeyboardEvent) {
    e.preventDefault()
    this.game.onKeyDown(e)
  }

  onKeyUp(e) {
    this.game.onKeyUp(e)
  }

  refreshRenderer() {
    this.data = this.renderer.render(this.game)
  }

  constructor() {
    super()
    this.data = this.renderer.render(this.game)
  }
}
