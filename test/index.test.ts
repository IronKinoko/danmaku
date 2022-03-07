import Danmaku, { Comment } from '../src'

const comments: Comment[] = [
  { text: 'second', time: 1 },
  { text: 'first', time: 0.5 },
]
const container = document.createElement('div')
beforeEach(() => {
  container.innerHTML = ''
})
describe('danmaku opts', () => {
  it('should throw error', () => {
    // @ts-ignore
    expect(() => new Danmaku({ container: null })).toThrowError()
  })

  it('should have default opts', () => {
    const core = new Danmaku({ container })

    expect(core.opacity).toBe(1)
    expect(core.speed).toBe(144)
    expect(core.comments).toStrictEqual([])
    expect(core.media).toBeUndefined()
  })

  it('should sort comments and not modify origin data', () => {
    const core = new Danmaku({
      container,
      comments,
    })

    expect(core.comments[1].time > core.comments[0].time).toBeTruthy()
    expect(comments[1].time < comments[0].time).toBeTruthy()
  })

  it('should set danmaku stage opacity', () => {
    const core = new Danmaku({
      container,
      opacity: 0.6,
    })

    expect(core.opacity).toBe(0.6)
    expect(core.stage.style.opacity).toBe('0.6')

    core.opacity = 2
    expect(core.opacity).toBe(1)
    expect(core.stage.style.opacity).toBe('1')

    core.opacity = -1
    expect(core.opacity).toBe(0)
    expect(core.stage.style.opacity).toBe('0')
  })

  it('should set danmaku speed', () => {
    const core = new Danmaku({ container, speed: 0 })

    expect(core.speed).toBe(144)

    core.speed = 110
    expect(core.speed).toBe(110)

    core.speed = -1
    expect(core.speed).toBe(110)

    expect(new Danmaku({ container, speed: 120 }).speed).toBe(120)
  })
})
