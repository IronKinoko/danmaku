import createEngine from '../engine/index.js'
import { raf } from '../utils.js'

/* eslint no-invalid-this: 0 */
export default function () {
  if (!this._.visible || !this._.paused) {
    return this
  }
  if (this.media) {
    this._.runningList.forEach((cmt) => {
      cmt._utc = Date.now() / 1000 - (this.media.currentTime - cmt.time)
    })

    if (this._.paused) {
      this._.engine.play({
        stage: this._.stage,
        comments: this._.runningList,
        pbr: this.media ? this.media.playbackRate : 1,
        currentTime: this.media ? this.media.currentTime : Date.now(),
        duration: this._.duration,
      })
    }
  }

  this._.paused = false

  var that = this
  var engine = createEngine(
    this._.engine.framing.bind(this),
    this._.engine.setup.bind(this),
    this._.engine.render.bind(this),
    this._.engine.remove.bind(this)
  )
  function frame() {
    engine.call(that)
    that._.requestID = raf(frame)
  }
  this._.requestID = raf(frame)
  return this
}
