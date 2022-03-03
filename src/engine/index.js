import allocate from '../internal/allocate.js'

export default function (framing, setup, render, remove) {
  return function () {
    framing(this._.stage)
    const currentTime = this._.currentTime
    const pbr = this.media ? this.media.playbackRate : 1
    for (let i = this._.runningList.length - 1; i >= 0; i--) {
      const cmt = this._.runningList[i]
      const cmtTime = cmt.time
      if (currentTime - cmtTime > cmt._.fullDuration) {
        remove(this._.stage, cmt)
        this._.runningList.splice(i, 1)
      }
    }
    const pendingList = []
    while (this._.position < this.comments.length) {
      const cmt = this.comments[this._.position]
      const cmtTime = cmt.time
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
      render({ cmt, pbr })
      this._.runningList.push(cmt)
    })
  }
}
