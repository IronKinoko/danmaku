/* eslint no-invalid-this: 0 */
export default function () {
  if (!this.media) return

  this.refresh()
  return this
}
