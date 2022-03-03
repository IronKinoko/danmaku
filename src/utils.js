export const raf =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  function (cb) {
    return setTimeout(cb, 50 / 3)
  }

export const caf =
  window.cancelAnimationFrame ||
  window.mozCancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  clearTimeout

export function binsearch(arr, prop, key) {
  let mid = 0
  let left = 0
  let right = arr.length
  while (left < right - 1) {
    mid = (left + right) >> 1
    if (key >= arr[mid][prop]) {
      left = mid
    } else {
      right = mid
    }
  }
  if (arr[left] && key < arr[left][prop]) {
    return left
  }
  return right
}

export function formatMode(mode) {
  if (!/^(ltr|top|bottom)$/i.test(mode)) {
    return 'rtl'
  }
  return mode.toLowerCase()
}

function collidableRange() {
  const max = 9007199254740991
  return [
    { range: 0, time: -max, width: max, height: 0 },
    { range: max, time: max, width: 0, height: 0 },
  ]
}

export function resetSpace(space) {
  space.ltr = collidableRange()
  space.rtl = collidableRange()
  space.top = collidableRange()
  space.bottom = collidableRange()
}

export function bindEngine(engine) {
  const ret = {}
  for (const key in engine) {
    if (Object.hasOwnProperty.call(engine, key)) {
      const value = engine[key]
      if (typeof value === 'function') {
        ret[key] = value.bind(this)
      } else ret[key] = value
    }
  }
  return ret
}
