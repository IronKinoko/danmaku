import Danmaku from '../danmaku'
import type { InnerComment, RunningComment, Stage } from '../types'
import { clamp } from '../utils'
import { checkSimilarity } from './similarity'

const stylesheetId = 'danmaku-styles-v2'
const stylesheet = `
@keyframes danmaku-scroll-v2 {
  0% { transform: translateX(var(--offset)); }
  100% { transform: translateX(calc(var(--offset) + var(--translateX))); }
}
.danmaku-stage {
  overflow: hidden;
  white-space: nowrap;
  transform: translateZ(0);
  position: relative;
  pointer-events: none;
}
.danmaku { position: absolute; }
.danmaku--scrolling {
  left: 0;
  will-change: transform;
  animation: danmaku-scroll-v2 var(--duration) linear var(--delay) both;
}
.danmaku--scrolling.danmaku--paused { animation-play-state: paused; }
.danmaku--fixed {
  left: 50%;
  transform: translateX(-50%);
}
.danmaku--top { top: var(--top); }
.danmaku--bottom { bottom: var(--bottom); }
`

function ensureStylesheet() {
  if (document.getElementById(stylesheetId)) return

  const style = document.createElement('style')
  style.id = stylesheetId
  style.textContent = stylesheet
  document.head.appendChild(style)
}

function createCommentNode(cmt: InnerComment) {
  const node = document.createElement('div')
  let customRendered = false
  if (typeof cmt.render === 'function') {
    const $el = cmt.render()
    if ($el instanceof HTMLElement) {
      node.appendChild($el)
      customRendered = true
    }
  }
  if (!customRendered) {
    node.textContent = cmt.text || ''
    if (cmt.style) {
      Object.assign(node.style, cmt.style)
    }
  }
  node.className = 'danmaku'
  return node
}

function init() {
  ensureStylesheet()
  const stage = document.createElement('div')
  stage.classList.add('danmaku-stage')
  return stage
}

function clear(stage: Stage) {
  stage.replaceChildren()
}

function resize(stage: Stage) {
  stage.style.width = stage.width + 'px'
  stage.style.height = stage.height + 'px'
}

function setup(this: Danmaku, stage: Stage, comments: InnerComment[]) {
  const df = document.createDocumentFragment()
  const pendingComments = comments.reduce<RunningComment[]>((arr, cmt) => {
    let isMerged = false
    if (this._.merge && !cmt.render && cmt.text) {
      const text = cmt.text
      const matches = (runningCmt: RunningComment) =>
        runningCmt.mode === cmt.mode &&
        !!runningCmt.text &&
        checkSimilarity(runningCmt.text, text).isSimilar
      const firstCmt = this._.runningList.find(matches) || arr.find(matches)
      if (firstCmt) {
        isMerged = true
        firstCmt.node.dataset.count =
          parseInt(firstCmt.node.dataset.count || '1') + 1 + ''

        firstCmt.node.textContent = `(${firstCmt.node.dataset.count})${firstCmt.text}`
      }
    }

    if (!isMerged) {
      const node = createCommentNode(cmt)
      df.appendChild(node)
      arr.push({ ...cmt, node } as RunningComment)
    }

    return arr
  }, [])

  if (pendingComments.length) {
    stage.appendChild(df)
  }

  pendingComments.forEach((cmt) => {
    cmt.width = cmt.width || cmt.node.offsetWidth
    cmt.height = cmt.height || cmt.node.offsetHeight

    cmt._ = {
      fullDuration:
        cmt.mode === 'top' || cmt.mode === 'bottom'
          ? clamp(4, this._.duration, 9)
          : this._.duration,
      fullWidth: cmt.width + stage.width,
    }
  })
  return pendingComments
}

function configureAnimation(
  stage: Stage,
  cmt: RunningComment,
  duration: number,
  currentTime: number,
  playbackRate: number
) {
  const rate = playbackRate > 0 ? playbackRate : 1
  const isRTL = cmt.mode === 'rtl'
  cmt._.fullDuration = duration
  cmt._.fullWidth = stage.width + cmt.width
  cmt.node.style.setProperty(
    '--offset',
    `${isRTL ? stage.width : -cmt.width}px`
  )
  cmt.node.style.setProperty(
    '--translateX',
    `${isRTL ? -cmt._.fullWidth : cmt._.fullWidth}px`
  )
  cmt.node.style.setProperty('--duration', `${duration / rate}s`)
  cmt.node.style.setProperty(
    '--delay',
    `${-Math.max(0, currentTime - cmt.time) / rate}s`
  )
  cmt.node.classList.toggle('danmaku--paused', playbackRate <= 0)
}

function render(
  this: Danmaku,
  { cmt, playbackRate }: { cmt: RunningComment; playbackRate: number }
) {
  if (cmt.mode === 'rtl' || cmt.mode === 'ltr') {
    cmt.node.style.setProperty('--top', `${cmt.y}px`)
    configureAnimation(
      this._.stage,
      cmt,
      this._.duration,
      this._.currentTime,
      playbackRate
    )
    cmt.node.classList.add('danmaku--scrolling')
  } else {
    cmt.node.classList.add(
      'danmaku--fixed',
      cmt.mode === 'top' ? 'danmaku--top' : 'danmaku--bottom'
    )
    cmt.node.style.setProperty(
      cmt.mode === 'top' ? '--top' : '--bottom',
      `${cmt.y}px`
    )
  }
}

function remove(this: Danmaku, stage: Stage, cmt: RunningComment) {
  stage.removeChild(cmt.node)
}

function pause({ comments }: { comments: RunningComment[] }) {
  comments.forEach((cmt) => {
    if (cmt.mode === 'rtl' || cmt.mode === 'ltr') {
      cmt.node.classList.add('danmaku--paused')
    }
  })
}

function play(
  this: Danmaku,
  {
    stage,
    comments,
    playbackRate,
    currentTime,
    duration,
  }: {
    stage: Stage
    comments: RunningComment[]
    playbackRate: number
    currentTime: number
    duration: number
  }
) {
  let hasScrollingComments = false
  let nextExpiry = Infinity
  comments.forEach((cmt) => {
    if (cmt.mode === 'rtl' || cmt.mode === 'ltr') {
      hasScrollingComments = true
      cmt.node.classList.remove('danmaku--scrolling')
      configureAnimation(stage, cmt, duration, currentTime, playbackRate)
    } else {
      cmt._.fullDuration = clamp(4, duration, 9)
    }
    nextExpiry = Math.min(nextExpiry, cmt.time + cmt._.fullDuration)
  })
  this._.nextExpiry = nextExpiry
  if (!hasScrollingComments) return
  // Flush the removal before restarting the animation at the media time.
  void stage.offsetWidth
  comments.forEach((cmt) => {
    if (cmt.mode === 'rtl' || cmt.mode === 'ltr') {
      cmt.node.classList.add('danmaku--scrolling')
    }
  })
}

export default {
  name: 'dom',
  init: init,
  clear: clear,
  resize: resize,
  setup: setup,
  render: render,
  remove: remove,
  pause: pause,
  play: play,
}
