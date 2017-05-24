import MersenneTwister from "mersenne-twister"

export interface MinoRandomizer {
  newMinoSet(minoSet: Set<number>)
  getMinoSet(): Set<number>
  next(): number
  reset()
}

export class MinoRandomizerBag implements MinoRandomizer {
  private generator: MersenneTwister
  constructor(private minoSet: Set<number>, readonly seed: number) {
    this.generator = new MersenneTwister(seed)
  }
  private bag: Set<number> = new Set(this.minoSet)

  getMinoSet(): Set<number> { return this.minoSet }

  newMinoSet(minoSet: Set<number>) {
    this.minoSet = minoSet
    this.bag = new Set(minoSet)
  }

  next(): number {
    if(this.bag.size == 0) this.bag = new Set(this.minoSet)
    const list = Array.from(this.bag)
    const result = list[Math.floor((this.generator.random() * list.length))]
    this.bag.delete(result)
    return result
  }

  reset() { console.error("Not implemented") }
}
