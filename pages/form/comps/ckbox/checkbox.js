// pages/form/comps/ckbox/checkbox.js
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
    index: {
      type: Number,
      value: 0,
    },
    disable: {
      type: Boolean,
      value: false,
    }
  },

  /* 组件的初始数据 */
  data: {
    
  },

  observers: {
    'value': function (value) {
      const { attrs = { options: []}} = this.data
      if (value) {
        var kv = {}
        value.value.map( v => {
          kv[v.id] = v
        })
        attrs.options.map( opt => {
          opt.checked = kv[opt.id] && kv[opt.id].checked
        })
        this.setData({ attrs })
      }
    }
  },

  /* 组件的方法列表 */
  methods: {
    click: function(e) {
      if (!this.data.disable) {
        var index = e.currentTarget.dataset.index
        var item = this.data.attrs.options[index]
        item.checked = item.checked? false:true
        this.setData({ attrs: this.data.attrs })
      }
    },

    getResult: function(e) {
      var { options } = this.data.attrs
      var result = options.filter( opt => opt.checked )
      if (result.length == 0 ) {
        return undefined
      }
      return {type:"checkbox", value: result}
    }
  }
})
