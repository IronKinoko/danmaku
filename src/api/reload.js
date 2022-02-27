import { formatMode } from '../utils'

/* eslint-disable no-invalid-this */
export default function (comments) {
  this.clear()
  this.comments = comments || []
  this.comments.sort(function (a, b) {
    return a.time - b.time
  })
  for (var i = 0; i < this.comments.length; i++) {
    this.comments[i].mode = formatMode(this.comments[i].mode)
  }
  return this
}
