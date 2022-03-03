import { caf, raf } from '../utils'

export default function () {
  if (!this._.visible || this._.paused) {
    return this
  }

  this._.engine.pause({
    stage: this._.stage,
    comments: this._.runningList,
    currentTime: this._.currentTime,
  })
  this._.rafIds.forEach(caf)
  this._.rafIds.clear()

  raf(() => {
    this._.engine.play({
      stage: this._.stage,
      comments: this._.runningList,
      pbr: this.media ? this.media.playbackRate : 1,
      currentTime: this._.currentTime,
      duration: this._.duration,
      rafIds: this._.rafIds,
    })
  })
  return this
}
