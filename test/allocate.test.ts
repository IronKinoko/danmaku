import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import allocate from '../src/internal/allocate'
import Danmaku from '../src/danmaku'
import type { Mode, RunningComment } from '../src/types'

class TestDanmaku extends Danmaku {
  get state() {
    return this._
  }

  place(comment: RunningComment) {
    return allocate.call(this, comment)
  }
}

describe('comment lane allocation', () => {
  let container: HTMLDivElement
  let media: HTMLVideoElement
  let currentTime: number
  let core: TestDanmaku

  function comment(
    mode: Mode,
    time: number,
    duration: number,
    width = 20,
    height = 10
  ): RunningComment {
    return {
      text: 'comment',
      mode,
      time,
      node: document.createElement('div'),
      width,
      height,
      y: 0,
      _: { fullDuration: duration, fullWidth: core.stage.width + width },
    }
  }

  beforeEach(() => {
    currentTime = 0
    container = document.createElement('div')
    media = document.createElement('video')
    Object.defineProperties(container, {
      offsetWidth: { value: 100 },
      offsetHeight: { configurable: true, value: 100 },
    })
    Object.defineProperty(media, 'currentTime', { get: () => currentTime })
    Object.defineProperty(media, 'paused', { value: true })
    core = new TestDanmaku({ container, media })
  })

  afterEach(() => {
    core.destroy()
    container.remove()
    vi.restoreAllMocks()
  })

  it('uses the first lane for a new comment and a separate lane on collision', () => {
    const first = comment('rtl', 0, 4)
    const second = comment('rtl', 0, 4)
    expect(core.place(first)).toBe(0)
    expect(core.place(second)).toBe(10)
  })

  it('allows a faster comment through after the existing comment leaves its path', () => {
    currentTime = 7.9
    const existing = comment('rtl', 0, 8)
    const arriving = comment('rtl', currentTime, 4)
    core.place(existing)
    expect(core.place(arriving)).toBe(0)
  })

  it('avoids collisions when the incoming comment cannot catch up', () => {
    currentTime = 3.9
    const existing = comment('ltr', 0, 4)
    const arriving = comment('ltr', currentTime, 4)
    core.place(existing)
    expect(core.place(arriving)).toBe(0)
  })

  it('keeps top and bottom comments in separate vertical lanes until expiry', () => {
    const first = comment('top', 0, 5)
    const second = comment('top', 0, 5, 20, 15)
    const bottom = comment('bottom', 0, 5)
    expect(core.place(first)).toBe(0)
    expect(core.place(second)).toBe(10)
    expect(core.place(bottom)).toBe(0)
    currentTime = 5
    expect(core.place(comment('top', 5, 5))).toBe(0)
  })

  it('rejects a colliding comment when there is no remaining lane', () => {
    Object.defineProperty(container, 'offsetHeight', {
      configurable: true,
      value: 10,
    })
    core.resize()
    const first = comment('rtl', 0, 4)
    const second = comment('rtl', 0, 4)
    expect(core.place(first)).toBe(0)
    expect(core.place(second)).toBeNull()
  })

  it('wraps lanes when overlap is enabled', () => {
    Object.defineProperty(container, 'offsetHeight', {
      configurable: true,
      value: 30,
    })
    core.resize()
    core.overlap = true
    expect(core.place(comment('rtl', 0, 4))).toBe(0)
    expect(core.place(comment('rtl', 0, 4))).toBe(10)
    expect(core.place(comment('rtl', 0, 4))).toBe(0)
  })
})
