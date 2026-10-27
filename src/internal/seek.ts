import Danmaku from '../danmaku'
import { binsearch, clamp } from '../utils'

export default function (this: Danmaku) {
  if (!this.media) {
    return this
  }
  this.clear()
  const position = binsearch(
    this.comments,
    'time',
    this._.currentTime - Math.max(this._.duration, clamp(4, this._.duration, 9))
  )
  this._.position = Math.max(0, position - 1)
  return this
}
