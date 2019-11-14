const kawa = require('../../../kawa.js')

// pages/tmpl/tab/kw-tab.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    items: {
      type: Array,
      value: [],
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    theme: {
      mainColor: kawa.Theme.MainColor,
      tabColor: kawa.Theme.TabSelectedColor || kawa.Theme.MainColor,
    },
    current: 0, //预设默认选中的栏目
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickTab: function(e) {
      var idx = e.target.dataset.idx;
      var current = this.data.current
      if (current != idx) {
        this.setData({ current: idx })
      }
      this.triggerEvent('onTabChanged', idx)
    }
  }
})
