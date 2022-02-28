import allocate from '../internal/allocate.js'

/* eslint no-invalid-this: 0 */
export default function (framing, setup, render, remove) {
  return function () {
    framing(this._.stage)
    var dateNow = Date.now() / 1000
    var currentTime = this.media ? this.media.currentTime : dateNow
    var pbr = this.media ? this.media.playbackRate : 1
    var cmt = null
    var cmtTime = 0
    var i = 0
    for (i = this._.runningList.length - 1; i >= 0; i--) {
      cmt = this._.runningList[i]
      cmtTime = this.media ? cmt.time : cmt._utc
      if (currentTime - cmtTime > this._.duration) {
        remove(this._.stage, cmt)
        this._.runningList.splice(i, 1)
      }
    }
    var pendingList = []
    while (this._.position < this.comments.length) {
      cmt = this.comments[this._.position]
      cmtTime = this.media ? cmt.time : cmt._utc
      if (cmtTime >= currentTime) {
        break
      }
      // when clicking controls to seek, media.currentTime may changed before
      // `pause` event is fired, so here skips comments out of duration,
      // see https://github.com/weizhenye/Danmaku/pull/30 for details.
      if (currentTime - cmtTime > this._.duration) {
        ++this._.position
        continue
      }
      if (this.media) {
        cmt._utc = dateNow - (this.media.currentTime - cmtTime)
      }
      pendingList.push(cmt)
      ++this._.position
    }
    setup(this._.stage, pendingList)

    pendingList.forEach((cmt) => {
      cmt.y = allocate.call(this, cmt)
      render({
        stage: this._.stage,
        cmt,
        pbr,
        currentTime,
        duration: this._.duration,
        speed: this._.speed,
      })
      this._.runningList.push(cmt)
    })
  }
}
