export default function () {
  this._.engine.pause(this._.stage, this._.runningList)
  this._.engine.play({
    stage: this._.stage,
    comments: this._.runningList,
    pbr: this.media ? this.media.playbackRate : 1,
    currentTime: this.media ? this.media.currentTime : Date.now(),
    duration: this._.duration,
    speed: this._.speed,
  })
  return this
}
