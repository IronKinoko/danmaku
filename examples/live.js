import Danmaku from '../dist/esm/danmaku.js'
import { genComment } from './genComment.js'
;(function () {
  const $ = (selector) => document.querySelector(selector)

  const core = new Danmaku({
    container: $('.danmaku-container'),
  })

  const ob = new ResizeObserver(() => {
    core.resize()
  })
  ob.observe($('.danmaku-container'))

  window.core = core

  $('#show').onclick = () => {
    core.show()
  }
  $('#hide').onclick = () => core.hide()

  setInterval(() => {
    core.emit(genComment())
  }, 100)
})()
