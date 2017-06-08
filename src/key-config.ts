export enum KeyState {
  RELEASED, JUST_PRESSED, PRESSED, JUST_RELEASED
}

export class KeyConfig {
  readonly config = new Map<string, string>()
  readonly state = new Map<string, boolean>()
  readonly frameState = new Map<string, KeyState>()

  constructor(
    left: string,
    right: string,
    down: string,
    lock: string,
    quick: string,
    ccw: string,
    cw: string,
    rotate180: string,
    hold: string,
    reset: string,
    revert: string,
    commit: string
  ) {
    this.config.set("left", left)
    this.config.set("right", right)
    this.config.set("down", down)
    this.config.set("lock", lock)
    this.config.set("quick", quick)
    this.config.set("ccw", ccw)
    this.config.set("cw", cw)
    this.config.set("rotate180", rotate180)
    this.config.set("hold", hold)
    this.config.set("reset", reset)
    this.config.set("revert", revert)
    this.config.set("commit", commit)
    this.config.forEach((_, key) => {
      this.state.set(key, false)
      this.frameState.set(key, KeyState.RELEASED)
    })
  }

  onKeyDown(e: KeyboardEvent) {
    this.state.forEach((state, key) => {
      const keyName = this.config.get(key)
      if(e.code == keyName) {
        this.state.set(key, true)
      }
    })
  }

  onKeyUp(e) {
    this.state.forEach((state, key) => {
      const keyName = this.config.get(key)
      if(e.code == keyName) {
        this.state.set(key, false)
      }
    })
  }

  update() {
    this.frameState.forEach((state, key) => {
      const pressed = this.state.get(key)
      switch(state) {
        case KeyState.RELEASED:
          if(pressed) this.frameState.set(key, KeyState.JUST_PRESSED)
          break
        case KeyState.JUST_PRESSED:
          this.frameState.set(key, pressed ? KeyState.PRESSED : KeyState.JUST_RELEASED)
          break
        case KeyState.PRESSED:
          if(!pressed) this.frameState.set(key, KeyState.JUST_RELEASED)
          break
        case KeyState.JUST_RELEASED:
          this.frameState.set(key, pressed ? KeyState.JUST_PRESSED : KeyState.RELEASED)
          break
      }
    })
  }

  reset() {
    this.state.forEach((_, key) => this.state.set(key, false))
    this.frameState.forEach((_, key) => this.frameState.set(key, KeyState.RELEASED))
  }
}
