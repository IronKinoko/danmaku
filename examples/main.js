import { data } from './data.js'
import Danmaku from '../dist/esm/danmaku.js'
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
})()
