import { describe, expect, it } from 'vitest'
import Danmaku from '../src/danmaku'
import {
  bindEngine,
  binsearch,
  clamp,
  resetSpace,
  transComment,
} from '../src/utils'

describe('utility functions', () => {
  it('finds insertion points in sorted arrays including duplicates', () => {
    const values = [{ time: 1 }, { time: 2 }, { time: 2 }, { time: 4 }]
    expect(binsearch(values, 'time', 0)).toBe(0)
    expect(binsearch(values, 'time', 2)).toBe(3)
    expect(binsearch(values, 'time', 3)).toBe(3)
    expect(binsearch(values, 'time', 5)).toBe(4)
    expect(binsearch([], 'time', 1)).toBe(0)
  })

  it('sorts a copied comment list and supplies the default mode', () => {
    const comments = [
      { text: 'later', time: 2 },
      { text: 'fixed', time: 1, mode: 'top' as const },
    ]
    const sorted = transComment(comments)
    expect(sorted.map(({ text, mode }) => [text, mode])).toEqual([
      ['fixed', 'top'],
      ['later', 'rtl'],
    ])
    expect(comments[0].text).toBe('later')
  })

  it('creates independent collision sentinels for each mode', () => {
    const space = resetSpace({})
    expect(Object.keys(space)).toEqual(['ltr', 'rtl', 'top', 'bottom'])
    expect(space.ltr).toHaveLength(2)
    expect(space.ltr[0].range).toBe(0)
    expect(space.ltr[1].range).toBe(Number.MAX_SAFE_INTEGER)
    expect(space.ltr).not.toBe(space.rtl)
    expect(space.ltr[0]).not.toBe(space.rtl[0])
  })

  it('binds only own engine functions to the instance', () => {
    const context = { value: 42 }
    const inherited = () => 'inherited'
    const engine = Object.assign(Object.create({ inherited }), {
      read(this: { value: number }) {
        return this.value
      },
      value: 10,
    })
    const instance = Object.assign(
      Object.create(Danmaku.prototype) as Danmaku,
      context
    )
    const bound = bindEngine.call(instance, engine)
    expect(bound.read()).toBe(42)
    expect(bound.value).toBe(10)
    expect(bound.inherited).toBeUndefined()
  })

  it('clamps a value to the supplied range', () => {
    expect(clamp(0, -1, 10)).toBe(0)
    expect(clamp(0, 5, 10)).toBe(5)
    expect(clamp(0, 11, 10)).toBe(10)
  })
})
