// pages/form/comps/ckbox/checkbox.js
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
    
  },

  /* 组件的方法列表 */
  methods: {
    click: function(e) {
      var index = e.currentTarget.dataset.index
      var item = this.data.attrs.options[index]
      item.checked = item.checked? false:true
      this.setData({ attrs: this.data.attrs })
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
