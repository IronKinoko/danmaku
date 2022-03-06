import { raf } from '../utils'

export function createCommentNode(cmt) {
  const node = document.createElement('div')
  node.style.cssText = 'position:absolute;'
  if (typeof cmt.render === 'function') {
    const $el = cmt.render()
    if ($el instanceof HTMLElement) {
      node.appendChild($el)
      return node
    }
  }
  if (cmt.mode === 'top' || cmt.mode === 'bottom') {
    node.style.left = '50%'
    node.style.transform = 'translateX(-50%)'
  }
  node.style.willChange = 'transform, opacity'

  node.textContent = cmt.text
  if (cmt.style) {
    Object.assign(node.style, cmt.style)
  }
  return node
}

export function init() {
  const stage = document.createElement('div')
  stage.style.cssText =
    'overflow:hidden;white-space:nowrap;transform:translateZ(0);position:relative;pointer-events:none;'
  return stage
}

export function clear(stage) {
  let lc = stage.lastChild
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
  const df = document.createDocumentFragment()
  comments.forEach((cmt) => {
    cmt.node = cmt.node || createCommentNode(cmt)
    df.appendChild(cmt.node)
  })
  if (comments.length) {
    stage.appendChild(df)
  }

  const currentTime = this._.currentTime
  const duration = this._.duration

  comments.forEach((cmt) => {
    cmt.width = cmt.width || cmt.node.offsetWidth
    cmt.height = cmt.height || cmt.node.offsetHeight

    cmt._ = {
      // 剩余时长
      duration: duration - (currentTime - cmt.time),
      // 全部时长
      fullDuration: this._.duration,
    }
    if (cmt.mode === 'rtl' || cmt.mode === 'ltr') {
      const isRTL = cmt.mode === 'rtl'
      const fullWidth = cmt.width + stage.width
      const offset = ((currentTime - cmt.time) / duration) * fullWidth
      const start = isRTL ? stage.width - offset : offset - cmt.width
      const end = isRTL ? -cmt.width : stage.width

      if (isRTL) cmt.node.style.left = start + 'px'
      else cmt.node.style.right = end - offset + 'px'

      Object.assign(cmt._, {
        // 偏移量
        end: end - start,
        // 起始偏移时间
        currentTime: currentTime,
        // 剩余总长
        leftWidth: Math.abs(fullWidth - offset),
        // 全长
        fullWidth: fullWidth,
      })
    }
  })
}

export function render({ cmt, pbr }) {
  if (cmt.mode === 'rtl' || cmt.mode === 'ltr') {
    cmt.node.style.top = cmt.y + 'px'

    cmt.node.style.transform = `translateX(0)`
    const rafId = raf(() => {
      cmt.node.style.transform = `translateX(${cmt._.end}px)`
      cmt.node.style.transition = `transform ${cmt._.duration / pbr}s linear`
      this._.rafIds.delete(rafId)
    })
    this._.rafIds.add(rafId)
  } else if (cmt.mode === 'top') {
    cmt.node.style.top = cmt.y + 'px'
  } else if (cmt.mode === 'bottom') {
    cmt.node.style.bottom = cmt.y + 'px'
  }
}

export function remove(stage, cmt) {
  stage.removeChild(cmt.node)
  if (!this.media) {
    cmt.node = null
  }
}

export function pause({ comments, currentTime }) {
  comments.forEach((cmt) => {
    if (cmt.mode === 'rtl' || cmt.mode === 'ltr') {
      const isRTL = cmt.mode === 'rtl'

      const offset =
        ((currentTime - cmt._.currentTime) / cmt._.duration) * cmt._.leftWidth

      cmt.node.style.transition = ''
      cmt.node.style.transform = `translateX(${isRTL ? '-' : ''}${offset}px)`
      cmt.node.style.animationPlayState = 'paused'
    }
  })
}

export function play({ comments, pbr, currentTime }) {
  comments.forEach((cmt) => {
    if (cmt.mode === 'rtl' || cmt.mode === 'ltr') {
      cmt.node.style.animationPlayState = ''
      cmt.node.style.transform = `translateX(${cmt._.end}px)`
      cmt.node.style.transition = `transform ${
        (cmt._.duration - (currentTime - cmt._.currentTime)) / pbr
      }s linear`
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
