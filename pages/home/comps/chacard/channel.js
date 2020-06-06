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
    items: [
      {
        name: "今日签到",
        url: "/pages/signin/signin",
        color: "#69be51",
        image: "/res/academy_icon.png",
      },
      {
        name: "报名活动",
        url: "/pages/enroll/list/list",
        color: "#f49c44",
        image: "/res/hot_icon.png",
      },
      {
        name: "问卷调查",
        url: "/pages/form/list/list",
        color: "#e14162",
        image: "/res/selection_icon.png",
      },
      {
        name: "投票活动",
        url: "/pages/poll/list/list",
        color: "#5f7ef6",
        image: "/res/hashtag.png",
      },
      {
        name: "积分商城",
        url: "/pages/point/point",
        color: "#5f7ef6",
        image: "/res/hashtag.png",
      }, 
    ],
    kv: {}, // url => hot?
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

// 显示小红点的逻辑
// 签到：记录
// 活动、问卷、投票记录最后进入时间，和最新的活动创建时间做比较如果早于活动
// 创建时间则提示，如果晚于则说明刚刚看过了
function firstLoad(view) {
  var viewlog = wx.getStorageSync('viewlog') || {}
  api.getHotList().then( resp => {
    var hots = resp.data
    var kv = {}
    hots && hots.map( hot => {
      if (hot.value.created_at > (viewlog[hot.key] || 0)) {
        kv[`/pages/${hot.key}/list/list`] = true
      }
    })
    view.setData({ kv })
  }).catch( err => {
    console.log("get hots err", err)
  })
}
