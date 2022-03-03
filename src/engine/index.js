import allocate from '../internal/allocate.js'

export default function (framing, setup, render, remove) {
  return function () {
    framing(this._.stage)
    const dateNow = Date.now() / 1000
    const currentTime = this.media ? this.media.currentTime : dateNow
    const pbr = this.media ? this.media.playbackRate : 1
    for (let i = this._.runningList.length - 1; i >= 0; i--) {
      const cmt = this._.runningList[i]
      const cmtTime = this.media ? cmt.time : cmt._utc
      if (currentTime - cmtTime > cmt.duration) {
        remove(this._.stage, cmt)
        this._.runningList.splice(i, 1)
      }
    }
    const pendingList = []
    while (this._.position < this.comments.length) {
      const cmt = this.comments[this._.position]
      const cmtTime = this.media ? cmt.time : cmt._utc
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
