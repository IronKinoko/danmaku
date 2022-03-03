import { unbindEvents } from '../internal/events.js'
import pause from '../internal/pause.js'

export default function () {
  if (!this.container) {
    return this
  }

  pause.call(this)
  this.clear()
  this.container.removeChild(this._.stage)
  if (this.media) {
    unbindEvents.call(this, this._.listener)
  }
  for (const key in this) {
    if (Object.prototype.hasOwnProperty.call(this, key)) {
      this[key] = null
    }
  }
  return this
}
