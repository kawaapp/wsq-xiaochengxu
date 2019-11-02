// pages/tmpl/link/kw-link.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    link: {
      type: Object,
      value: {}
    }
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
    openlink: function() {
      var url = this.data.link.url
      if (url) {
        wx.navigateTo({
          url: '/pages/webview/webview?q=' + encodeURI(url),
        })
      }
    }
  }
})
