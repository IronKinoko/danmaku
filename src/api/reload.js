import seek from '../internal/seek'
import { formatMode } from '../utils'

/* eslint-disable no-invalid-this */
export default function (comments) {
  this.clear()
  this.comments = (comments || []).map((cmt) => ({ ...cmt }))
  this.comments.sort((a, b) => a.time - b.time)
  this.comments.forEach((cmt) => {
    cmt.mode = formatMode(cmt.mode)
  })
  seek.call(this)
  return this
}
