// pages/tmpl/post/kw-post.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },

  lifetimes: {
    attached: function () {
      setup(this)
    },
  },

  attached: function () {
    setup(this)
  },

  /**
   * 组件的初始数据
   */
  data: {
    media: {},
    location: {},
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})

function setup(view) {
  parseMedia(view)
  parseLocation(view)
}

function parseMedia(view) {
  var media = view.data.item.media
  if (media) {
    try {
      var m = {}
      if (media.type == 1) {
        m.images = JSON.parse(media.path)
      } else if (media.type == 3) {
        m.video = JSON.parse(media.path)
      } else if (media.type == 4) {
        m.link = JSON.parse(media.path)
      }
      view.setData({ media: m})
    } catch(err){}
  }
}

function parseLocation(view) {
  var location = view.data.item.location
  if (location) {
    try {
      var location = JSON.parse(location)
      view.setData({ location: location })
    } catch (err) { }
  }
}

