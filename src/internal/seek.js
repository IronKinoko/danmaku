import { binsearch, resetSpace } from '../utils.js'

export default function () {
  if (!this.media) {
    return this
  }
  this.clear()
  resetSpace(this._.space)
  const position = binsearch(
    this.comments,
    'time',
    this._.currentTime - this._.duration
  )
  this._.position = Math.max(0, position - 1)
  return this
}
