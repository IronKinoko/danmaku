import Danmaku from '../src/danmaku'
import { genComment, random } from './genComment.js'

function genComments(mergeMode) {
  return [...Array(9999)].map((_, i) => {
    let text = ''

    if (mergeMode) text = ['a', 'b', 'c', 'd'][random(0, 3)]
    return genComment(i / 30, text)
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

  $('#merge').onclick = () => {
    core.merge = !core.merge

    core.reload(genComments(core.merge))
  }

  $('#overlap').onclick = () => {
    core.overlap = !core.overlap
  }
})()
