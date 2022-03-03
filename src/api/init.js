import domEngine from '../engine/dom.js'
import { bindEvents } from '../internal/events.js'
import play from '../internal/play.js'
import seek from '../internal/seek.js'
import { bindEngine, formatMode, resetSpace } from '../utils.js'

export default function (opt) {
  this._ = {}
  this.container = opt.container || document.createElement('div')
  this.media = opt.media
  this._.visible = true

  this._.engine = bindEngine.call(this, domEngine)

  this._.requestID = 0

  this._.speed = Math.max(0, opt.speed) || 144
  this._.duration = 4

  this.comments = (opt.comments || []).map((cmt) => ({ ...cmt }))
  this.comments.sort((a, b) => a.time - b.time)
  this.comments.forEach((cmt) => {
    cmt.mode = formatMode(cmt.mode)
  })
  this._.rafIds = new Set()
  this._.runningList = []
  this._.position = 0

  this._.paused = true
  if (this.media) {
    this._.listener = {}
    bindEvents.call(this, this._.listener)
  }

  this._.stage = this._.engine.init(this.container)
  this._.stage.style.cssText += 'position:relative;pointer-events:none;'

  this.resize()
  this.container.appendChild(this._.stage)

  this._.space = {}
  resetSpace(this._.space)

  if (!this.media || !this.media.paused) {
    seek.call(this)
    play.call(this)
  }
  return this
}
