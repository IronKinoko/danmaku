import { raf } from '../utils'

export function createCommentNode(cmt) {
  var node = document.createElement('div')
  node.style.cssText = 'position:absolute;'
  if (typeof cmt.render === 'function') {
    var $el = cmt.render()
    if ($el instanceof HTMLElement) {
      node.appendChild($el)
      return node
    }
  }
  if (cmt.mode === 'top' || cmt.mode === 'bottom') {
    node.style.left = '50%'
    node.style.transform = 'translateX(-50%)'
    node.style.willChange = 'transform, opacity'
  }
  node.textContent = cmt.text
  if (cmt.style) {
    for (var key in cmt.style) {
      node.style[key] = cmt.style[key]
    }
  }
  return node
}

export function init() {
  var stage = document.createElement('div')
  stage.style.cssText =
    'overflow:hidden;white-space:nowrap;transform:translateZ(0);'
  return stage
}

export function clear(stage) {
  var lc = stage.lastChild
  while (lc) {
    stage.removeChild(lc)
    lc = stage.lastChild
  }
}

export function resize(stage) {
  stage.style.width = stage.width + 'px'
  stage.style.height = stage.height + 'px'
}

export function framing() {
  //
}

export function setup(stage, comments) {
  var df = document.createDocumentFragment()
  var i = 0
  var cmt = null
  for (i = 0; i < comments.length; i++) {
    cmt = comments[i]
    cmt.node = cmt.node || createCommentNode(cmt)
    df.appendChild(cmt.node)
  }
  if (comments.length) {
    stage.appendChild(df)
  }
  for (i = 0; i < comments.length; i++) {
    cmt = comments[i]
    cmt.width = cmt.width || cmt.node.offsetWidth
    cmt.height = cmt.height || cmt.node.offsetHeight
  }
}

export function render({ stage, cmt, pbr, duration, currentTime }) {
  if (cmt.mode === 'rtl' || cmt.mode === 'ltr') {
<<<<<<< HEAD
    const maxWidth = cmt.width + stage.width
    const percent = (currentTime - cmt.time) / duration
    const offset = maxWidth * percent
    const start = cmt.mode === 'rtl' ? stage.width - offset : offset - cmt.width
=======
    const start = cmt.mode === 'rtl' ? stage.width : 0 - cmt.width
>>>>>>> 18cfed5e5a33e1d86031b55dff838eab6f9e494e
    const end = cmt.mode === 'rtl' ? -cmt.width : stage.width
    cmt.node.style.transform = `translateX(${start}px) translateY(${cmt.y}px) translateZ(0)`

    raf(() => {
      cmt.node.style.transform = `translateX(${end}px) translateY(${cmt.y}px) translateZ(0)`
      cmt.node.style.transition = `transform ${
        (duration - (currentTime - cmt.time)) / pbr
      }s linear`
    })
  } else {
    cmt.node.style.top = cmt.y + 'px'
  }
}
/* eslint no-invalid-this: 0 */
export function remove(stage, cmt) {
  stage.removeChild(cmt.node)
  /* istanbul ignore else */
  if (!this.media) {
    cmt.node = null
  }
}

export function pause(comments) {
  comments.forEach((cmt) => {
    if (cmt.mode === 'rtl' || cmt.mode === 'ltr') {
      const { x } = cmt.node.getBoundingClientRect()
      cmt.node.style.transition = ''
      cmt.node.style.transform = `translateX(${x}px) translateY(${cmt.y}px) translateZ(0)`
    }
  })
}

export function play({ stage, comments, pbr, duration, currentTime }) {
  comments.forEach((cmt) => {
    if (cmt.mode === 'rtl' || cmt.mode === 'ltr') {
      const end = cmt.mode === 'rtl' ? -cmt.width : stage.width

      raf(() => {
        cmt.node.style.transform = `translateX(${end}px) translateY(${cmt.y}px) translateZ(0)`
        cmt.node.style.transition = `transform ${
          (duration - (currentTime - cmt.time)) / pbr
        }s linear`
      })
    }
  })
}

export default {
  name: 'dom',
  init: init,
  clear: clear,
  resize: resize,
  framing: framing,
  setup: setup,
  render: render,
  remove: remove,
  pause: pause,
  play: play,
}
