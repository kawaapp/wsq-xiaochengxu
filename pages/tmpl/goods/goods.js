import biz from '../../../utils/biz.js'

// pages/tmpl/goods/goods.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goods: {
      type: Object,
      value: {}
    },
    content: {
      type: String,
      value: ""
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
    clickGoods: function() {
      biz.openLink(this.data.goods)
    }
  }
})
