import Danmaku from '../dist/esm/danmaku.js'

function genComments() {
  return [...Array(9999)].map((_, i) => {
    return {
      text: i,
      time: i / 30,
      style: { color: 'white' },
    }
  })
}

// eslint-disable-next-line no-extra-semi
;(function () {
  const $ = (selector) => document.querySelector(selector)

  const core = new Danmaku({
    container: $('.danmaku-container'),
    media: $('video'),
    comments: genComments(),
  })

  const ob = new ResizeObserver(() => {
    core.resize()
  })
  ob.observe($('.danmaku-container'))

  window.core = core

  $('#show').onclick = () => {
    core.reload(genComments())
    core.show()
  }
  $('#hide').onclick = () => core.hide()
})()
