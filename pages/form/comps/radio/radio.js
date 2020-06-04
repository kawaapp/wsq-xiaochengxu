// pages/form/comps/radio/radio.js
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
    checkedIndex: -1,
  },

  observers: {
    'value': function (value) {
      const { attrs = { options: [] } } = this.data
      if (value) {
        attrs.options.map( (attr, i) => {
          if (attr.id === value.value.id) {
            this.setData({ checkedIndex: i})
          }
        })
      }
    }
  },

  /* 组件的方法列表 */
  methods: {
    click: function(e) {
      if (!this.data.disable) {
        var index = e.currentTarget.dataset.index
        this.setData({ checkedIndex: index }) 
      }
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
