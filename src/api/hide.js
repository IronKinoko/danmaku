import pause from '../internal/pause.js'

export default function () {
  if (!this._.visible) {
    return this
  }
  pause.call(this)
  this.clear()
  this._.visible = false
  return this
}
