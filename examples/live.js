import Danmaku from '../dist/esm/danmaku.js'

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
    core.emit({
      text: Math.random().toString(16),
      style: { color: 'white' },
    })
  }, 100)
})()
