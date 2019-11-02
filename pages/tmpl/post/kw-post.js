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
      parseMedia(this)
    },
  },

  attached: function () {
    parseMedia(this)
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})

function parseMedia(view) {
  var post = view.data.item
  var touch = false
  if (post.media) {
    try {
      if (post.media.type == 1) {
        post.images = JSON.parse(post.media.path)
      } else if (post.media.type == 3) {
        post.video = JSON.parse(post.media.path)
      } else if (post.media.type == 4) {
        post.link = JSON.parse(post.media.path)
      }
      touch = true
    } catch(err){}
  }
  if (post.location) {
    try {
      post.location = JSON.parse(post.location)
      touch = true
    } catch (err) { }
  }
  if (touch) {
    view.setData({ item: post })
  }
}


