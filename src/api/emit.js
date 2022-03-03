import { formatMode, binsearch } from '../utils.js'

export default function (obj) {
  if (!obj || Object.prototype.toString.call(obj) !== '[object Object]') {
    return this
  }
  const cmt = Object.assign({}, obj)
  cmt.text = (cmt.text ?? '').toString()
  cmt.mode = formatMode(cmt.mode)
  if (this.media) {
    let position = 0
    if (cmt.time === undefined) {
      cmt.time = this.media.currentTime
      position = this._.position
    } else {
      position = binsearch(this.comments, 'time', cmt.time)
      if (position < this._.position) {
        this._.position += 1
      }
    }
    this.comments.splice(position, 0, cmt)
  } else {
    cmt.time = Date.now() / 1000
    this.comments.push(cmt)
  }
  return this
}
