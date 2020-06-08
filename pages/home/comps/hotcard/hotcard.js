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

  }
})

function firstLoad(view) {
  api.getHotList().then( resp => {
    var items = resp.data
    items && items.map( item => {
        item.typeStr = TypeNameMap[item.key] || ''
        if (item.key == 'form') {
          item.value_image = item.value.image || '/res/act2.png'
        } else {
          item.value_image = item.value.image || item.value.poster
        } 
        item.url = `/pages/${item.key}/${item.key}?id=${item.value.id}`
    })
    view.setData({ items: resp.data })
  }).catch( err => {
    console.log("get hots err", err)
  })
}

const TypeNameMap = {
  poll: "投票",
  enroll: "报名",
  form: "问卷"
}
