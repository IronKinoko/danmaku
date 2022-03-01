import { caf } from '../utils'

export default function () {
  if (!this._.visible || this._.paused) {
    return this
  }

  this._.engine.pause(this._.stage, this._.runningList)
  this._.rafIds.forEach(caf)
  this._.rafIds.clear()

  if (this.media) {
    this._.runningList.forEach((cmt) => {
      cmt._utc = Date.now() / 1000 - (this.media.currentTime - cmt.time)
    })
  }
  this._.engine.play({
    stage: this._.stage,
    comments: this._.runningList,
    pbr: this.media ? this.media.playbackRate : 1,
    currentTime: this.media ? this.media.currentTime : Date.now(),
    duration: this._.duration,
    rafIds: this._.rafIds,
  })
  return this
}
