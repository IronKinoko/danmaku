import Danmaku from '../danmaku'
import createEngine from '../engine/index'
import { raf } from '../utils'

export default function (this: Danmaku) {
  if (!this._.visible || !this._.paused) {
    return this
  }
  this._.paused = false
  this.refresh()

  const engine = createEngine(
    this._.engine.setup,
    this._.engine.render,
    this._.engine.remove
  ).bind(this)

  const frame = () => {
    engine()
    this._.requestID = raf(frame)
  }
  this._.requestID = raf(frame)
  return this
}
