import { Comment } from '..'
import Danmaku from '../danmaku'
import allocate from '../internal/allocate'
import type { RunningComment, Stage } from '../types'
import { clamp } from '../utils'

export default function (
  setup: (stage: Stage, comments: Comment[]) => RunningComment[],
  render: (arg0: { cmt: RunningComment; playbackRate: number }) => void,
  remove: (stage: Stage, cmt: RunningComment) => void
) {
  return function (this: Danmaku) {
    const currentTime = this._.currentTime
    if (currentTime >= this._.nextExpiry) {
      let activeCount = 0
      let nextExpiry = Infinity
      for (const cmt of this._.runningList) {
        const expiry = cmt.time + cmt._.fullDuration
        if (currentTime - cmt.time > cmt._.fullDuration) {
          remove(this._.stage, cmt)
        } else {
          this._.runningList[activeCount++] = cmt
          nextExpiry = Math.min(nextExpiry, expiry)
        }
      }
      this._.runningList.length = activeCount
      this._.nextExpiry = nextExpiry
    }
    if (
      this._.position >= this.comments.length ||
      this.comments[this._.position].time >= currentTime
    ) {
      return
    }
    const pendingList = []
    while (this._.position < this.comments.length) {
      const cmt = this.comments[this._.position]
      const cmtTime = cmt.time
      if (cmtTime >= currentTime) {
        break
      }

      const duration =
        cmt.mode === 'top' || cmt.mode === 'bottom'
          ? clamp(4, this._.duration, 9)
          : this._.duration
      if (currentTime - cmtTime > duration || duration <= 0) {
        ++this._.position
        continue
      }
      pendingList.push(cmt)
      ++this._.position
    }
    if (!this.media && this._.position > 0) {
      this.comments.splice(0, this._.position)
      this._.position = 0
    }
    if (pendingList.length === 0) return
    const playbackRate = this.media ? this.media.playbackRate : 1
    const runningComments = setup(this._.stage, pendingList)

    runningComments.forEach((cmt) => {
      const y = allocate.call(this, cmt)
      if (y === null) {
        remove(this._.stage, cmt)
        return
      }
      cmt.y = y
      render({ cmt, playbackRate })
      this._.runningList.push(cmt)
      this._.nextExpiry = Math.min(
        this._.nextExpiry,
        cmt.time + cmt._.fullDuration
      )
    })
  }
}
