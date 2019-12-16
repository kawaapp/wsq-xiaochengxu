// pages/poll/comps/detail.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    poll: {
      type: Object,
      value: {},
    },
    show: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    title: "投票细则"
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickClose: function() {
      this.triggerEvent('onRequestClose')
    }
  }
})
