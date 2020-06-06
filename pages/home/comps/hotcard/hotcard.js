const api = require('../../../../utils/api.js')

Component({
  /* 组件的属性列表 */
  properties: {

  },

  lifetimes: {
    attached: function() {
      firstLoad(this)
    }
  },

  /* 组件的初始数据 */
  data: {
    items: [],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    click: function(e) {
      var item = e.currentTarget.dataset.item
      var kv = this.data.kv
      kv[item.url] = false
      this.setData({ kv })
    }
  }
})

function firstLoad(view) {
  api.getHotList().then( resp => {
    var items = resp.data
    items && items.map( item => {
        item.typeStr = TypeNameMap[item.type] || ''
    })
    view.setData({ hots: resp.data })
  }).catch( err => {
    console.log("get hots err", err)
  })
}

const TypeNameMap = {
  poll: "投票",
  enroll: "报名",
  form: "问卷"
}
