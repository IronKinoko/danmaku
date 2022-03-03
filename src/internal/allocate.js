export default function (cmt) {
  const ct = this._.currentTime
  const pbr = this.media ? this.media.playbackRate : 1
  const willCollide = (cr, cmt) => {
    if (cmt.mode === 'top' || cmt.mode === 'bottom') {
      return ct - cr.time < this._.duration
    }
    const crTotalWidth = this._.stage.width + cr.width
    const crElapsed = (crTotalWidth * (ct - cr.time) * pbr) / this._.duration
    if (cr.width > crElapsed) {
      return true
    }
    // (rtl mode) the right end of `cr` move out of left side of stage
    const crLeftTime = this._.duration + cr.time - ct
    const cmtTotalWidth = this._.stage.width + cmt.width
    const cmtTime = cmt.time
    const cmtElapsed = (cmtTotalWidth * (ct - cmtTime) * pbr) / this._.duration
    const cmtArrival = this._.stage.width - cmtElapsed
    // (rtl mode) the left end of `cmt` reach the left side of stage
    const cmtArrivalTime =
      (this._.duration * cmtArrival) / (this._.stage.width + cmt.width)
    return crLeftTime > cmtArrivalTime
  }
  const crs = this._.space[cmt.mode]
  let last = 0
  let curr = 0
  for (let i = 1; i < crs.length; i++) {
    const cr = crs[i]
    let requiredRange = cmt.height
    if (cmt.mode === 'top' || cmt.mode === 'bottom') {
      requiredRange += cr.height
    }
    if (cr.range - cr.height - crs[last].range >= requiredRange) {
      curr = i
      break
    }
    if (willCollide(cr, cmt)) {
      last = i
    }
  }
  const channel = crs[last].range
  const crObj = {
    range: channel + cmt.height,
    time: cmt.time,
    width: cmt.width,
    height: cmt.height,
  }
  crs.splice(last + 1, curr - last - 1, crObj)
  return channel % (this._.stage.height - cmt.height)
}
