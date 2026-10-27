import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Danmaku, { Comment } from '../src'
import * as similarity from '../src/engine/similarity'

class TestDanmaku extends Danmaku {
  get state() {
    return this._
  }

  get runningComments() {
    return this._.runningList
  }
}

describe('CSS animation rendering', () => {
  let container: HTMLDivElement
  let media: HTMLVideoElement
  let width: number
  let currentTime: number
  let playbackRate: number
  let playbackRateReads: number
  let paused: boolean
  let core: TestDanmaku

  const frame = () => vi.advanceTimersByTime(20)
  const nodes = () =>
    Array.from(core.stage.querySelectorAll<HTMLDivElement>('.k-danmaku'))

  function start(comments: Comment[]) {
    core = new TestDanmaku({ container, media, comments, speed: 150 })
    paused = false
    media.dispatchEvent(new Event('play'))
    frame()
  }

  beforeEach(() => {
    vi.useFakeTimers()
    width = 600
    currentTime = 1
    playbackRate = 1
    playbackRateReads = 0
    paused = true
    container = document.createElement('div')
    media = document.createElement('video')
    Object.defineProperties(container, {
      offsetWidth: { configurable: true, get: () => width },
      offsetHeight: { configurable: true, value: 300 },
    })
    Object.defineProperties(media, {
      currentTime: { get: () => currentTime },
      playbackRate: {
        get: () => {
          playbackRateReads++
          return playbackRate
        },
      },
      paused: { get: () => paused },
    })
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100)
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(20)
    document.body.appendChild(container)
  })

  afterEach(() => {
    core?.destroy()
    container.remove()
    vi.restoreAllMocks()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('uses linear keyframes and distance variables for both directions', () => {
    start([
      { text: 'rtl', time: 0 },
      { text: 'ltr', time: 0, mode: 'ltr' },
      { text: 'styled', time: 0, style: { fontSize: '25px' } },
    ])
    const [rtl, ltr, styled] = nodes()
    const styles = document.getElementById('k-danmaku-styles-v2')
    expect(styles?.parentElement).toBe(document.head)
    expect(styles?.textContent).toContain(
      'translateX(calc(var(--offset) + var(--translateX)))'
    )
    expect(styles?.textContent).toContain(
      'animation: k-danmaku-scroll-v2 var(--duration) linear var(--delay) both'
    )
    expect(rtl.classList).toContain('k-danmaku--scrolling')
    expect(rtl.style.getPropertyValue('--offset')).toBe('600px')
    expect(rtl.style.getPropertyValue('--translateX')).toBe('-700px')
    expect(rtl.style.getPropertyValue('--duration')).toBe('4s')
    expect(rtl.style.getPropertyValue('--delay')).toBe('-1s')
    expect(ltr.style.getPropertyValue('--offset')).toBe('-100px')
    expect(ltr.style.getPropertyValue('--translateX')).toBe('700px')
    expect(rtl.style.transition).toBe('')
    expect(rtl.style.position).toBe('')
    expect(styled.style.fontSize).toBe('25px')
    expect(styled.style.position).toBe('')
    expect(core.stage.style.position).toBe('')
  })

  it('pauses and resynchronizes after resume and rate changes', () => {
    start([{ text: 'test', time: 0 }])
    const node = nodes()[0]
    currentTime = 2
    paused = true
    media.dispatchEvent(new Event('pause'))
    expect(node.classList).toContain('k-danmaku--paused')

    playbackRate = 2
    media.dispatchEvent(new Event('ratechange'))
    paused = false
    media.dispatchEvent(new Event('play'))
    expect(node.classList).not.toContain('k-danmaku--paused')
    expect(node.style.getPropertyValue('--duration')).toBe('2s')
    expect(node.style.getPropertyValue('--delay')).toBe('-1s')

    playbackRate = 0.5
    media.dispatchEvent(new Event('ratechange'))
    expect(node.style.getPropertyValue('--duration')).toBe('8s')
    expect(node.style.getPropertyValue('--delay')).toBe('-4s')
  })

  it('recomputes distance and timing on speed and size changes', () => {
    start([{ text: 'test', time: 0 }])
    const node = nodes()[0]
    core.speed = 300
    expect(node.style.getPropertyValue('--duration')).toBe('2s')
    width = 900
    core.resize()
    expect(node.style.getPropertyValue('--offset')).toBe('900px')
    expect(node.style.getPropertyValue('--translateX')).toBe('-1000px')
    expect(node.style.getPropertyValue('--duration')).toBe('3s')
    expect(node.style.getPropertyValue('--delay')).toBe('-1s')
  })

  it('restores active comments after seeking and keeps the keyframes after clear', () => {
    start([{ text: 'test', time: 0 }])
    currentTime = 2
    media.dispatchEvent(new Event('seeking'))
    expect(nodes()).toHaveLength(0)
    expect(document.getElementById('k-danmaku-styles-v2')).not.toBeNull()
    expect(core.stage.querySelector('style')).toBeNull()
    frame()
    expect(nodes()[0].style.getPropertyValue('--delay')).toBe('-2s')
    currentTime = 5
    media.dispatchEvent(new Event('seeking'))
    frame()
    expect(nodes()).toHaveLength(0)
  })

  it('centers fixed comments including custom renders and uses their fixed lifetime', () => {
    width = 150
    currentTime = 3
    start([
      { time: 0, mode: 'top', render: () => document.createElement('span') },
      { time: 0, mode: 'bottom', text: 'bottom' },
    ])
    const [top, bottom] = nodes()
    expect(top.firstElementChild?.tagName).toBe('SPAN')
    expect(top.classList).toContain('k-danmaku--fixed')
    expect(top.classList).toContain('k-danmaku--top')
    expect(top.style.getPropertyValue('--top')).toBe('0px')
    expect(bottom.classList).toContain('k-danmaku--bottom')
    expect(bottom.style.getPropertyValue('--bottom')).toBe('0px')
    currentTime = 4.1
    frame()
    expect(nodes()).toHaveLength(0)
  })

  it('emits at the current media time when time is omitted', () => {
    start([])
    core.emit({ text: 'new' })
    expect(core.comments[0].time).toBe(1)
    currentTime = 1.1
    frame()
    expect(
      parseFloat(nodes()[0].style.getPropertyValue('--delay'))
    ).toBeCloseTo(-0.1)
  })

  it('restores comments after hiding and showing without removing the stylesheet', () => {
    start([{ text: 'test', time: 0 }])
    core.hide()
    expect(nodes()).toHaveLength(0)
    expect(document.getElementById('k-danmaku-styles-v2')).not.toBeNull()
    expect(core.stage.querySelector('style')).toBeNull()
    currentTime = 2
    core.show()
    frame()
    expect(nodes()[0].style.getPropertyValue('--delay')).toBe('-2s')
  })

  it('freezes at a zero playback rate and resumes on a positive rate', () => {
    start([{ text: 'test', time: 0 }])
    const node = nodes()[0]
    playbackRate = 0
    media.dispatchEvent(new Event('ratechange'))
    expect(node.classList).toContain('k-danmaku--paused')
    playbackRate = 1
    media.dispatchEvent(new Event('ratechange'))
    expect(node.classList).not.toContain('k-danmaku--paused')
  })

  it('renders and clears live comments', () => {
    core = new TestDanmaku({ container, speed: 150 })
    core.emit({ text: 'live' })
    frame()
    expect(nodes()).toHaveLength(1)
    expect(core.comments).toHaveLength(0)
    expect(nodes()[0].classList).toContain('k-danmaku--scrolling')
    core.clear()
    core.emit({ text: 'next' })
    frame()
    expect(nodes().map((node) => node.textContent)).toEqual(['next'])
  })

  it('discards processed live comments while keeping hidden comments pending', () => {
    core = new TestDanmaku({ container, speed: 150, overlap: true })
    for (let i = 0; i < 100; i++) core.emit({ text: `comment ${i}` })
    frame()
    expect(core.comments).toHaveLength(0)
    expect(nodes()).toHaveLength(100)

    core.hide()
    core.emit({ text: 'while hidden' })
    expect(core.comments).toHaveLength(1)
    frame()
    expect(core.comments).toHaveLength(1)
    core.show()
    frame()
    expect(core.comments).toHaveLength(0)
    expect(nodes().map((node) => node.textContent)).toEqual(['while hidden'])
    frame()
    expect(nodes()).toHaveLength(1)
  })

  it('does not create fragments or scan active comments on idle frames', () => {
    start([{ text: 'test', time: 0 }])
    const state = core.runningComments[0]._
    const duration = state.fullDuration
    let reads = 0
    Object.defineProperty(state, 'fullDuration', {
      configurable: true,
      get: () => {
        reads++
        return duration
      },
    })
    const fragments = vi.spyOn(document, 'createDocumentFragment')
    playbackRateReads = 0
    vi.advanceTimersByTime(1000)
    expect(fragments).not.toHaveBeenCalled()
    expect(reads).toBe(0)
    expect(playbackRateReads).toBe(0)
    currentTime = 4.1
    frame()
    expect(reads).toBeGreaterThan(0)
    expect(nodes()).toHaveLength(0)
  })

  it('updates expiration deadlines after a speed change', () => {
    start([
      { text: 'scroll', time: 0 },
      { text: 'fixed', time: 0, mode: 'top' },
    ])
    core.speed = 300
    currentTime = 2
    frame()
    expect(nodes()).toHaveLength(2)
    currentTime = 2.1
    frame()
    expect(nodes().map((node) => node.textContent)).toEqual(['fixed'])
    currentTime = 4.1
    frame()
    expect(nodes()).toHaveLength(0)
  })

  it('stops scanning when the next sorted comment is still in the future', () => {
    start([
      { text: 'ready', time: 0 },
      { text: 'later', time: 2 },
    ])
    expect(nodes().map((node) => node.textContent)).toEqual(['ready'])
    expect(core.comments[core.state.position].time).toBe(2)
  })

  it('skips expired comments and removes a comment rejected by lane allocation', () => {
    start([
      { text: 'expired', time: -10 },
      { text: 'first', time: 0 },
      { text: 'rejected', time: 0 },
    ])
    expect(nodes().map((node) => node.textContent)).toEqual([
      'first',
      'rejected',
    ])
    currentTime = 4.1
    frame()
    expect(nodes()).toHaveLength(0)

    core.destroy()
    currentTime = 1
    Object.defineProperty(container, 'offsetHeight', {
      configurable: true,
      value: 20,
    })
    core = new TestDanmaku({
      container,
      media,
      comments: [
        { text: 'first', time: 0 },
        { text: 'no lane', time: 0 },
      ],
      speed: 150,
    })
    paused = false
    media.dispatchEvent(new Event('play'))
    frame()
    expect(nodes().map((node) => node.textContent)).toEqual(['first'])
  })

  it('only compares merge candidates with the same mode', () => {
    const compare = vi.spyOn(similarity, 'checkSimilarity')
    core = new TestDanmaku({
      container,
      media,
      speed: 150,
      merge: true,
      comments: [
        { text: 'same', time: 0, mode: 'rtl' },
        { text: 'same', time: 0, mode: 'top' },
        { text: 'same', time: 0, mode: 'top' },
      ],
    })
    paused = false
    media.dispatchEvent(new Event('play'))
    frame()
    expect(compare).toHaveBeenCalledTimes(1)
    expect(nodes().map((node) => node.textContent)).toEqual(['same', '(2)same'])
  })
})
