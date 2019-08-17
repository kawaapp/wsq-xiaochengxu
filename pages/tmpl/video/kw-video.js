// pages/tmpl/video/kw-video.js
const kawa = require('../../../kawa.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    video: {
      type: Object,
      value: "",
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    theme: kawa.Theme.Image,
    showCover: true,
    autoplay: false,
  },

  ready() {
    this.initData();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initData() {
    },

    subscribePosition() {
      var view = this;
      wx.createIntersectionObserver(view)
        .relativeToViewport()
        .observe('#item-video', res => {
          if (res && res.intersectionRatio > 0) {
          } else {
            view.pause()
          }
        });
    },

    clickVideo: function() {
      this.play()
    },
    handleVideoEnded: function() {
      this.pause()
    },
    play() {
      this.setData({ showCover: false}, () => {
        this.subscribePosition()
      })
    },
    pause() {
      this.setData({ showCover: true})
    },
  }
})
