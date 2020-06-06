const kawa = require('../../../../kawa.js')

Component({
  /* 组件的属性列表 */
  properties: {
    value: {
      type: Object,
      value: {},
    }
  },

  /* 组件的初始数据 */
  data: {
    theme: { images: kawa.Theme.Image },

  },

  /* 组件的方法列表  */
  methods: {
    clickSpeaker: function () {
      var url = this.data.value.link
      if (url) {
        wx.navigateTo({
          url: '/pages/webview/webview?q=' + encodeURIComponent(url),
        })
      }
    }
  }
})