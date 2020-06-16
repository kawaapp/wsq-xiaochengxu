const kawa = require('../../../kawa.js')
const util = require('../../../utils/util.js')

Component({
  /* 组件的属性列表 */
  properties: {
  },

  /* 组件的初始数据 */
  data: {
    color: kawa.Theme.MainColor,
    show: false,
    text: '',
    image: '',
  },

  /* 组件的方法列表 */
  methods: {
    show: function(params) {
      this.setData({ show: true, params: params, text: '', image: '' })
    },

    hide: function() {
      this.setData({ show: false })
    },

    dummy: function(params) {
      // ingore
    },

    clickMask: function(){
      this.hide()
    },

    bindInput: function(e) {
      this.setData({ text: e.detail.value })
    },

    chooseImage: function(e) {
      if (this.data.hint) {
        return
      }
      var view = this
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: function (res) {
          if (res.tempFilePaths.length > 0) {
            view.setData({ image: res.tempFilePaths[0] })
          }
        },
      })
    },

    deleteImage: function(e) {
      this.setData({image: ''})
    },

    sendComment: function(e) {
      var { text, image, params } = this.data
      if (util.isWhiteSpace(text) && !image) {
        wx.showToast({
          title: '输入内容为空!', icon: "none"
        })
        return
      }

      if (params && params.success) {
        params.success({ text, image })
      }
      this.hide()
    }
  }
})





