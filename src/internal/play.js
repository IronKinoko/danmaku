import createEngine from '../engine/index.js'
import { raf } from '../utils.js'

/* eslint no-invalid-this: 0 */
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

  var that = this
  var engine = createEngine(
    this._.engine.framing,
    this._.engine.setup,
    this._.engine.render,
    this._.engine.remove
  )
  function frame() {
    engine.call(that)
    that._.requestID = raf(frame)
  }
  this._.requestID = raf(frame)
  return this
}
