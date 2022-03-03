import play from './play.js'
import pause from './pause.js'
import seek from './seek.js'
import ratechange from './ratechange.js'

export function bindEvents(_) {
  _.play = play.bind(this)
  _.pause = pause.bind(this)
  _.seeking = seek.bind(this)
  _.ratechange = ratechange.bind(this)
  this.media.addEventListener('play', _.play)
  this.media.addEventListener('pause', _.pause)
  this.media.addEventListener('playing', _.play)
  this.media.addEventListener('waiting', _.pause)
  this.media.addEventListener('seeking', _.seeking)
  this.media.addEventListener('ratechange', _.ratechange)
}

export function unbindEvents(_) {
  this.media.removeEventListener('play', _.play)
  this.media.removeEventListener('pause', _.pause)
  this.media.removeEventListener('playing', _.play)
  this.media.removeEventListener('waiting', _.pause)
  this.media.removeEventListener('seeking', _.seeking)
  this.media.removeEventListener('ratechange', _.ratechange)
  _.play = null
  _.pause = null
  _.seeking = null
  _.ratechange = null
}
