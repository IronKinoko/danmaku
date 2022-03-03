import createEngine from '../engine/index.js'
import { raf } from '../utils.js'

export default function () {
  if (!this._.visible || !this._.paused) {
    return this
  }
  if (this.media) {
    if (this._.paused) {
      this._.paused = false
      this.refresh()
    }
  }

  this._.paused = false

  let engine = createEngine(
    this._.engine.framing,
    this._.engine.setup,
    this._.engine.render,
    this._.engine.remove
  )
  const frame = () => {
    engine.call(this)
    this._.requestID = raf(frame)
  }
  this._.requestID = raf(frame)
  return this
}
