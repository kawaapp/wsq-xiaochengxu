
var view = undefined
var cursor = {top: 0, left: 0}
var size = {width: 0, height: 0}

function setup(_view) {
  view = _view
  cursor = { top: 0, left: 0 }
}

function start() {
  console.log("start drawing...")
  var tasks = []
  findImages(tasks, view.data.painting)

  if (tasks.length == 0) {
    startPainting(); return
  }

  Promise.all(tasks).then(res => {
    if (res && res.length > 0) {
      view.setData({ tempFileList: res })
    }
    startPainting()
  })
}

// 下载所有图片, 并得到尺寸
function findImages(tasks, group) {
  group.views && group.views.map( item => {
    if (item.type == 'image') {
      tasks.push(getImageInfo(item.url))
    }
    if (item.type == 'group') {
      findImages(tasks, item)
    }
  })
}

// 下载图片任务
function getImageInfo(url) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: url,
      success: (res) => {
        resolve({
          localUrl: res.path,
          url: url,
          width: res.width,
          height: res.height,
        })
      },
      fail: (error) => {
        resolve({
          localUrl: '/res/placeholder.png',
          url: url,
          width: 32,
          height: 32,
        })
      },
    })
  })
}

// 开始绘制, 经典的两遍布局
function startPainting() {
  console.log("start layout...")
  // reset 
  cursor = { top: 0, left: 0 }
  size = { width: 0, height: 0 }
  
  // 1. layout
  layout(view.data.painting)

  // reset canvas size
  const { mWidth, mHeight } = view.data.painting
  view.setData({ width: mWidth, height: mHeight})
  view.sizeChanged(mWidth, mHeight)
  
  // 2. drawing!
  draw(view.data.painting)
  
  // 3. saving 延迟保存图片，解决安卓生成图片错位bug。
  view.ctx.draw(false, () => {
    setTimeout(() => { saveImageToLocal() }, 800)
  })
}

function draw(group) {
  drawGroup(group)

  // draw child views
  group.views && group.views.map(item => {
      console.log("start draw item:", item)
      console.log("current cursor:", cursor)
      const { top, left } = cursor

      if (item.type == 'rect') {
        drawRect(item)
      } else if (item.type == 'text') {
        drawText(item)
      } else if (item.type == 'image') {
        drawImage(item)
      } else if (item.type == 'group') {
        draw(item)
      }
      // shift cursor
      if (group.horizontal) {
        cursor.left = left + item.mWidth + (item.marginLeft || 0)
        cursor.top = top
      } else {
        cursor.top = top + item.mHeight + (item.marginTop || 0)
        cursor.left = left
      }
  })
}

// wx don't support clip, draw a mask image instead
const WX_BUG_CLIP = true

function drawImage(params) {
  var { localUrl, mWidth = 0, mHeight = 0, marginLeft, marginTop = 0 } = params
  if (localUrl) {
    const { top, left } = cursor
    view.ctx.save()
    if (params.circle && !WX_BUG_CLIP) {
      var cx = left + marginLeft + mWidth/2
      var cy = top + marginTop + mHeight/2
      var r = mWidth/2     /* Assume that width = height */
      view.ctx.beginPath()
      view.ctx.arc(cx, cy, r, 0, 2 * Math.PI)
      view.ctx.clip()
    }
    view.ctx.drawImage(localUrl, left + marginLeft, top + marginTop, mWidth, mHeight)
    if (params.circle && WX_BUG_CLIP) {
      view.ctx.drawImage("/res/circle_mask.png", left + marginLeft, top + marginTop, mWidth, mHeight)
    }
    view.ctx.restore()
  }
}

function drawText(params) {
  view.ctx.save()
  const {
    MaxLineNumber = 2,
    breakWord = false,
    color = 'black',
    content = '',
    fontSize = 16,
    lineHeight = 20,
    textAlign = 'left',
    font = '',
    width,
    textDecoration = 'none',
    marginTop = 0,
    marginLeft = 0,
  } = params

  var { top, left } = cursor
  top += marginTop
  left += marginLeft

  view.ctx.beginPath()
  view.ctx.setTextBaseline('top')
  view.ctx.setTextAlign(textAlign)
  view.ctx.fillStyle = color
  //view.ctx.font = fontSize
  view.ctx.setFontSize(fontSize)
  if (font) {
    view.ctx.font = font
  }

  if (!breakWord) {
    view.ctx.fillText(content, left, top)
  } else {
    let fillText = ''
    let fillTop = top
    let lineNum = 1
    for (let i = 0; i < content.length; i++) {
      fillText += [content[i]]
      if (content[i] == '\n' || view.ctx.measureText(fillText).width > width) {
        if (lineNum === MaxLineNumber) {
          if (i !== content.length) {
            fillText = fillText.substring(0, fillText.length - 1) + '...'
            view.ctx.fillText(fillText, left, fillTop)
            fillText = ''
            break
          }
        }
        view.ctx.fillText(fillText, left, fillTop)
        fillText = ''
        fillTop += lineHeight
        lineNum++
      }
    }
    view.ctx.fillText(fillText, left, fillTop)
  }

  view.ctx.restore()
}

function drawRect(params) {
  view.ctx.save()
  const { background, width = 0, height = 0, marginLeft=0, marginTop=0} = params
  var { top, left } = cursor
  top += marginTop
  left += marginLeft
  console.log("draw react: ", left)
  view.ctx.setFillStyle(background)
  view.ctx.fillRect(left, top, width, height)
  view.ctx.restore()
}

function drawGroup(params) {
  view.ctx.save()
  const { background, mWidth, mHeight, marginLeft = 0, marginTop = 0 } = params
  if (background) {
    var { top, left } = cursor
    top += marginTop
    left += marginLeft

    view.ctx.setFillStyle(background)
    view.ctx.fillRect(left, top, mWidth, mHeight)
    view.ctx.restore()
  }
}

function saveImageToLocal() {
  console.log("start save image")
  const { width, height } = view.data
  wx.canvasToTempFilePath({
    x: 0,
    y: 0,
    width,
    height,
    canvasId: 'canvasdrawer',
    success(res) {
      console.log(res.tempFilePath)
    },
    fail(e) {
      console.log("save failured")
    },

    complete: res => {
      if (res.errMsg === 'canvasToTempFilePath:ok') {
        view.setData({
          showCanvas: false,
          isPainting: false,
          tempFileList: []
        })
        view.triggerEvent('getImage', { tempFilePath: res.tempFilePath, errMsg: 'canvasdrawer:ok' })
      } else {
        view.triggerEvent('getImage', { errMsg: 'canvasdrawer:fail' })
      }
    }
  }, view)
}

// here is layout engine
function layout(group) {
  if (group.views) {
    group.views.map( item => {
      if (item.type == 'rect') {
        measureRect(item)
      } else if (item.type == 'text') {
        measureText(item)
      } else if (item.type == 'image') {
        measureImage(item)
      } else if (item.type == 'group') {
        layout(item)
      }
    })
    var width  = 0 
    var height = 0

    if (group.horizontal) {
      group.views.map( item => {
        width += item.mWidth + (item.marginLeft || 0)
        height = Math.max(height, item.mHeight + (item.marginTop || 0))
      })
    } else {
      group.views.map( item => {
        height += item.mHeight + (item.marginTop || 0)
        width = Math.max(width, item.mWidth + (item.marginLeft || 0))
      })
    }
    group.mWidth = width
    group.mHeight = height
  } 

  if (group.width) {
    group.mWidth = group.width
  }
  if (group.height) {
    group.mHeight = group.height
  }

  // sync canvas size
  size.width = Math.max(size.width, group.mWidth)
  size.height = Math.max(size.height, group.mHeight)
  view.sizeChanged(size.width, size.height)
}

function measureRect(rect) {
  rect.mWidth = rect.width
  rect.mHeight = rect.height
}

function measureText(text) {
  view.ctx.save()
  var {
    breakWord = false,
    color = 'black',
    content = '',
    fontSize = 16,
    top = 0,
    left = 0,
    lineHeight = 20,
    textAlign = 'left',
    font = '',
    width,
    bolder = false,
    textDecoration = 'none'
  } = text

  view.ctx.beginPath()
  view.ctx.setTextBaseline('top')
  view.ctx.setTextAlign(textAlign)
  view.ctx.setFillStyle(color)
  view.ctx.setFontSize(fontSize)
  if (font) {
    view.ctx.font = font
  }

  let fillText = ''
  let fillTop = top
  let lineNum = 1

  for (let i = 0; i < content.length; i++) {
    fillText += [content[i]]
    if (content[i] == '\n' || view.ctx.measureText(fillText).width > width) {
      fillText = ''
      fillTop += lineHeight
      lineNum++
    }
  }
  text.mHeight = lineNum * lineHeight
  text.mWidth = width
  text.lines = lineNum
  view.ctx.restore()
}

function measureImage(image) {
  const tempFileList = view.data.tempFileList
  tempFileList.map( file => {
    if (file.url == image.url) {
      image.mWidth = image.width || file.width
      if (image.height) {
        image.mHeight = image.height 
      } else {
        image.mHeight = file.height * image.mWidth/file.width
      }
      image.localUrl = file.localUrl
    }
  })
}

module.exports = {
  setup: setup,
  start: start,
}