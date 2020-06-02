// pages/form/comps/radio/radio.js
Component({
  /* 组件的属性列表 */
  properties: {
    attrs: {
      type: Object,
      value: {},
    },
    index: {
      type: Number,
      value: 0,
    }
  },

  /* 组件的初始数据 */
  data: {
    checkedIndex: -1,
  },

  /* 组件的方法列表 */
  methods: {
    click: function(e) {
      var index = e.currentTarget.dataset.index
      this.setData({ checkedIndex: index })
    },
    getResult: function(e) {
      var { checkedIndex, attrs } = this.data
      if (checkedIndex < 0) {
        return undefined
      }
      return {
        type: "radio",
        value: attrs.options[checkedIndex]
      } 
    }
  }
})
