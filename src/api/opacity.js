export default {
  get: function () {
    return this._.opacity
  },
  set: function (s) {
    if (typeof s !== 'number' || isNaN(s)) {
      return this._.opacity
    }
    s = Math.min(Math.max(s, 0), 1)
    this._.opacity = s
    this._.stage.style.opacity = s
    return s
  },
}
