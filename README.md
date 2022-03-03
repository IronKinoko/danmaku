# Danmaku

Danmaku is a JavaScript library to display flying comments on HTML media elements (video and audio). It can also display comments to your container in real time without timeline.

## Installation

You can install it with npm:

```bash
npm install @ironkinoko/danmaku
```

```js
import Danmaku from '@ironkinoko/danmaku'
```

## Usage

### Media mode

```html
<div
  id="my-video-container"
  style="width:640px;height:360px;position:relative;"
>
  <video id="my-video" src="./example.mp4" style="position:absolute;"></video>
</div>

<div
  id="my-audio-container"
  style="width:640px;height:360px;position:relative;"
></div>
<audio id="my-audio" src="./example.mp3"></audio>

<script src="path/to/danmaku.min.js"></script>
<script>
  var danmaku1 = new Danmaku({
    container: document.getElementById('my-video-container'),
    media: document.getElementById('my-video'),
    comments: [],
  })
  var danmaku2 = new Danmaku({
    container: document.getElementById('my-audio-container'),
    media: document.getElementById('my-audio'),
    comments: [],
  })
</script>
```

### Live mode

To display comments in real time, you need to set up server and use something like [Socket.IO](http://socket.io/). Danmaku is just receiving comments data and display them to container.

Here is a simple example using with Socket.IO and Node.js.

Server:

```js
const app = require('http').createServer(handler)
const io = require('socket.io')(app)
app.listen(80)
function handler(req, res) {
  // your handler...
}
io.on('connection', (socket) => {
  socket.on('danmaku', (comment) => {
    socket.broadcast.emit('danmaku', comment)
  })
})
```

Client:

```html
<div id="my-container" style="width:640px;height:360px;"></div>
<button id="send-button">Send</button>

<script src="path/to/socket.io.js"></script>
<script src="path/to/danmaku.min.js"></script>
<script>
  var danmaku = new Danmaku({
    container: document.getElementById('my-container'),
  })
  var socket = io()
  socket.on('danmaku', function (comment) {
    danmaku.emit(comment)
  })
  var btn = document.getElementById('send-button')
  btn.addEventListener('click', function () {
    var comment = {
      text: 'bla bla',
      style: {
        fontSize: '20px',
        color: '#ffffff',
      },
    }
    danmaku.emit(comment)
    socket.emit('danmaku', comment)
  })
</script>
```

## API

### Initialization

```js
var danmaku = new Danmaku({
  // REQUIRED. The stage to display comments will be appended to container.
  container: document.getElementById('my-container'),

  // media can be <video> or <audio> element,
  // if it's not provided, Danmaku will be in live mode
  media: document.getElementById('my-media'),

  // Array of comment, used in media mode,
  // you can find its format in `danmaku.emit` API.
  comments: [],

  // You can also set speed by using `danmaku.speed` API.
  speed: 144,
})
```

### Emit a comment

```js
danmaku.emit({
  text: 'example',

  // 'rtl'(right to left) by default, available mode: 'ltr', 'rtl', 'top', 'bottom'.
  mode: 'rtl',

  // Specified in seconds, if not provided when using with media,
  // it will be set to `media.currentTime`. Not required in live mode.
  time: 233.3,

  // Danmaku will create a <div> node for each comment,
  // the style object will be set to `node.style` directly, just write with CSS rules.
  // For example:
  style: {
    fontSize: '20px',
    color: '#ffffff',
    border: '1px solid #337ab7',
    textShadow: '-1px -1px #000, -1px 1px #000, 1px -1px #000, 1px 1px #000',
  },

  // A custom render to draw comment.
  // when `render` exist, `text` and `style` will be ignored.

  // you should return an HTMLElement.
  render: function () {
    var $div = document.createElement('div')
    var $img = document.createElement('img')
    $img.src = '/path/to/xxx.png'
    $div.appendChild($img)
    return $div
  },
})
```

Tips:

- You may want to change line spacing by set `line-height` to each comment, a better way is set `line-height` to the container.

### Resize

Do it when you resize container.

```js
danmaku.resize()
```

### Show

```js
danmaku.show()
```

### Hide

If you set `display: none;` to the container directly when using DOM engine, you should also do danmaku.hide() otherwise the typesetting will be broken when it's showed.

```js
danmaku.hide()
```

### Clear

Clear current stage.

```js
danmaku.clear()
```

### Speed

There is a property `duration` for all comments, which means how long will a comment be shown to the stage. `duration` is calculated by `stage.width / danmaku.speed`, and `danmaku.speed` is a standard for all comments, because the actually speed for each comment is then calculated by `(comment.width + stage.width) / duration`. The default value is 144.

```js
danmaku.speed = 144
```

### Destroy

Destroy `danmaku` instance and release memory.

```js
danmaku.destroy()
```

## Thanks

fork from [Zhenye Wei](https://github.com/weizhenye)
