export function random(min, max) {
  return Math.round(Math.random() * (max - min)) + min
}

export function genComment(time, text) {
  const color = '#' + random(0, 16777215).toString(16)
  return {
    text: text || Math.random().toString(16).slice(2, 8),
    time,
    style: {
      color: 'white',
      border: '1px solid black',
      width: random(40, 300) + 'px',
      backgroundColor: color,
      opacity: 0.4,
    },
    mode: ['rtl', 'top', 'bottom', 'ltr'][random(0, 6)],
  }
}
