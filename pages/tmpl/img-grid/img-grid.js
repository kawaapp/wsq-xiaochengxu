// pages/tmpl/img-grid/img-grid.js
const ratio = getApp().globalData.ratio
const resize = {
  r1: `?x-oss-process=image/resize,w_${450 * ratio}`,
  r4: `?x-oss-process=image/resize,w_${300 * ratio}`,
  r9: `?x-oss-process=image/resize,w_${250 * ratio}`,
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    fill: {
      type: Boolean,
      value: false,
    },
    images: {
      type: Object,
      value: [],
    },
    mr: {
      type: String,
      value: '0px'
    }
  },

  lifetimes: {
    attached: function () {
      if (!this.data.fill) {
        this.setData({ images: fitImages(this) })
      }
    },
  },
  // 对 <2.2.3 版本基础库的兼容
  attached: function () {
    if (!this.data.fill) {
      this.setData({ images: fitImages(this) })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    images: [
      "https://images.kawaapp.com/img_bjkk50cdbfdqfm68t540.jpg",
    ],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickImage: function(e) {
      onClickImage(this, e)
    },
  }
})

function onClickImage(view, e) {
  var index = e.target.dataset.idx
  var images = getOriginImages(view.data.images)
  wx.previewImage({
    urls: images,
    current: images[index],
  })
}

function fitImages(view) {
  var images = view.data.images
  var suffix = ''
  if (images.length === 1) {
    suffix = resize.r1
  } else if (images.length === 4) {
    suffix = resize.r4
  } else {
    suffix = resize.r9
  }
  return images.map( item => {
    return item + suffix
  })
}

function getOriginImages(images) {
  var array = []
  images.map( item => {
      var i = item.indexOf('?')
      if (i > 0) {
        array.push(item.substring(0, i))
      } else {
        array.push(item)
      }
  })
  return array
}
