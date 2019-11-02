const kawa = require('../../../../kawa.js')

// pages/writer/comps/link/linkeditor.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false,
    },
    title: {
      type: String,
      value: "",
    },
    placeholder: {
      type: String,
      value: "",
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    theme: {
      color: kawa.Theme.MainColor,
    },
    reply: {
      text: "",
      enable: false,
    },
    textMessage: "",
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindInput: function (e) {
      var reply = this.data.reply
      reply.text = e.detail.value
      if (e.detail.value && !reply.enable) {
        reply.enable = true
        this.setData({ reply: reply })
      } else if (!e.detail.value && reply.enable) {
        reply.enable = false
        this.setData({ reply: reply })
      }
    },
    clickSubmit: function (e) {
      var myEventDetail = {
        value: this.data.reply.text
      } // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('onSubmit', myEventDetail, myEventOption)
      // clear input
      // this.setData({
      //   textMessage: "", reply: { text: "", enable: false }
      // })
    }, 

    clickCancel: function(e) {
      this.triggerEvent('onRequestClose')
    }
  }
})
