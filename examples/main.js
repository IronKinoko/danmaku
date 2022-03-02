import { data } from './data.js'
import Danmaku from '../dist/esm/danmaku.js'

data.forEach((o) => {
  o.time = +o.time

  // o.mode="rtl"
})

;(() => {
  const $ = (selector) => document.querySelector(selector)

  const core = new Danmaku({
    container: $('.danmaku-container'),
    media: $('video'),
    comments: data,
  })

  const ob = new ResizeObserver(() => {
    core.resize()
  })
  ob.observe($('.danmaku-container'))

  window.core = core

  $('#show').onclick = () => {
    core.reload(data)
    core.show()
  }
  $('#hide').onclick = () => core.hide()
})()
