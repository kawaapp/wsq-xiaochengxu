// pages/form/comps/input/input.js
Component({
  /* 组件的属性列表 */
  properties: {
    attrs: {
      type: Object,
      value: {},
    },
    value: {
      type: Object,
      value: undefined,
    },
    disable: {
      type: Boolean,
      value: false,
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

  observers: {
    'value': function (value) {
      if (value) {
        this.setData({text: value.value })
      }
    }
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
