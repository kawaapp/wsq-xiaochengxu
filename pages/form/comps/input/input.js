// pages/form/comps/input/input.js
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
    text: '', 
  },

  /* 组件的方法列表 */
  methods: {
    bindInput: function(e) {
      this.setData({text: e.detail.value })
    },
    getResult: function(e) {
      if (!this.data.text) {
        return undefined
      }
      return {type:"text", value: this.data.text}
    }
  }
})
