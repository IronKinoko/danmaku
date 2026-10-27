import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Danmaku from '../src/danmaku'
import type { Comment } from '../src/types'

class TestDanmaku extends Danmaku {
  get state() {
    return this._
  }
}

describe('Danmaku API', () => {
  let container: HTMLDivElement
  let media: HTMLVideoElement
  let core: TestDanmaku | undefined
  let currentTime: number
  let playbackRate: number
  let paused: boolean

  beforeEach(() => {
    vi.useFakeTimers()
    currentTime = 10
    playbackRate = 1
    paused = true
    container = document.createElement('div')
    media = document.createElement('video')
    Object.defineProperties(container, {
      offsetWidth: { configurable: true, value: 640 },
      offsetHeight: { value: 360 },
    })
    Object.defineProperties(media, {
      currentTime: { get: () => currentTime },
      playbackRate: { get: () => playbackRate },
      paused: { get: () => paused },
    })
    document.body.appendChild(container)
  })

  afterEach(() => {
    core?.destroy()
    container.remove()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('updates and clamps layout options and returns the instance', () => {
    core = new TestDanmaku({ container, media })
    expect(core.scrollAreaPercent).toBe(1)
    core.scrollAreaPercent = 0.1
    expect(core.scrollAreaPercent).toBe(0.25)
    core.scrollAreaPercent = 0
    expect(core.scrollAreaPercent).toBe(1)
    core.scrollAreaPercent = 2
    expect(core.scrollAreaPercent).toBe(1)

    core.overlap = true
    core.merge = true
    expect(core.overlap).toBe(true)
    expect(core.merge).toBe(true)
    expect(core.stage.width).toBe(640)
    expect(core.stage.height).toBe(360)
    expect(core.stage.style.width).toBe('640px')
    expect(core.stage.style.height).toBe('360px')
  })

  it('ignores invalid opacity and speed values', () => {
    core = new TestDanmaku({ container, media, speed: 100 })
    core.opacity = Number.NaN
    expect(core.opacity).toBe(1)
    core.opacity = 0.4
    expect(core.stage.style.opacity).toBe('0.4')

    core.speed = Number.NaN
    expect(core.speed).toBe(100)
    core.speed = Infinity
    expect(core.speed).toBe(100)
    core.speed = 0
    expect(core.speed).toBe(100)
  })

  it('resizes and recomputes the duration at the current speed', () => {
    let width = 640
    Object.defineProperty(container, 'offsetWidth', { get: () => width })
    core = new TestDanmaku({ container, media, speed: 160 })
    width = 800
    expect(core.resize()).toBe(core)
    expect(core.stage.width).toBe(800)
    expect(core.stage.style.width).toBe('800px')
    expect(core.state.duration).toBe(5)
  })

  it('reloads sorted comments and seeks to the relevant timeline position', () => {
    const comments: Comment[] = [
      { text: 'future', time: 10 },
      { text: 'recent', time: 8 },
      { text: 'old', time: 1 },
    ]
    currentTime = 14
    core = new TestDanmaku({ container, media, comments })
    core.reload(comments)
    expect(core.comments.map(({ text }) => text)).toEqual([
      'old',
      'recent',
      'future',
    ])
    expect(core.state.position).toBe(1)
    expect(core.state.runningList).toHaveLength(0)
  })

  it('emits comments at the playhead or in sorted time order', () => {
    currentTime = 5
    core = new TestDanmaku({
      container,
      media,
      comments: [
        { text: 'five', time: 5 },
        { text: 'ten', time: 10 },
      ],
    })
    core.state.position = 1
    core.emit({ text: 'at playhead' })
    expect(core.comments.map(({ time }) => time)).toEqual([5, 5, 10])

    core.emit({ text: 'earlier', time: 1 })
    expect(core.comments.map(({ time }) => time)).toEqual([1, 5, 5, 10])
    expect(core.state.position).toBe(2)
  })

  it('uses the wall clock in live mode even when an explicit time is given', () => {
    vi.setSystemTime(new Date('2026-01-02T03:04:05Z'))
    core = new TestDanmaku({ container })
    core.emit({ text: 'live', time: 1 })
    expect(core.comments[0].time).toBe(Date.now() / 1000)
  })

  it('refreshes only while visible and playing', () => {
    core = new TestDanmaku({ container, media })
    const playAnimation = vi.spyOn(core.state.engine, 'play')
    expect(core.refresh()).toBe(core)
    expect(playAnimation).not.toHaveBeenCalled()

    paused = false
    media.dispatchEvent(new Event('play'))
    expect(playAnimation).toHaveBeenCalledTimes(1)
    core.hide()
    expect(core.refresh()).toBe(core)
    expect(playAnimation).toHaveBeenCalledTimes(1)
  })

  it('shows and hides idempotently and resumes after media playback starts', () => {
    core = new TestDanmaku({ container, media })
    expect(core.show()).toBe(core)
    expect(core.hide()).toBe(core)
    expect(core.hide()).toBe(core)
    expect(core.stage.parentElement).toBe(container)

    expect(core.show()).toBe(core)
    expect(core.state.visible).toBe(true)
    expect(core.state.paused).toBe(true)
    paused = false
    media.dispatchEvent(new Event('play'))
    expect(core.state.paused).toBe(false)
  })

  it('clears running comments and resets collision state', () => {
    core = new TestDanmaku({ container, media })
    core.state.runningList.push({
      text: 'active',
      time: 1,
      mode: 'rtl',
      node: document.createElement('div'),
      width: 10,
      height: 10,
      y: 0,
      _: { fullDuration: 4, fullWidth: 650 },
    })
    core.state.nextExpiry = 5
    core.stage.appendChild(core.state.runningList[0].node)
    expect(core.clear()).toBe(core)
    expect(core.state.runningList).toHaveLength(0)
    expect(core.state.nextExpiry).toBe(Infinity)
    expect(core.stage.querySelector('.danmaku')).toBeNull()
    expect(core.state.space.rtl).toHaveLength(2)
  })

  it('unbinds media listeners and removes its stage on destroy', () => {
    core = new TestDanmaku({ container, media })
    const playAnimation = vi.spyOn(core.state.engine, 'play')
    core.destroy()
    expect(core.stage.parentElement).toBeNull()
    paused = false
    media.dispatchEvent(new Event('play'))
    expect(playAnimation).not.toHaveBeenCalled()
    expect(core.state.listener.play).toBeNull()
  })
})
