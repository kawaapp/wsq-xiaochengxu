const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
const app = getApp()

Component({
  properties: {

  },

  lifetimes: {
    attached: function () {
      setup(this)
    },
  },

  //组件的初始数据
  data: {
    polls: [],
  },

  //组件的方法列表
  methods: {
    clickPoll: function(e) {
      const poll = e.currentTarget.dataset.item
      onClickPoll(this, poll)
    }
  }
})

function setup(view) {
  api.getPollList().then( resp => {
    const polls = massage(resp.data)
    view.setData({ polls: polls })
  }).catch( err => {
    console.log("get poll err:", err)
  })
}

function onClickPoll(view, p) {
  wx.navigateTo({
    url: `/pages/poll/poll?id=${p.id}`,
  })
}

function massage(polls) {
  var polls = polls.slice(0, 3)
  polls.map( item => {
    item.expire = format(item.expired_at)
  })
  return polls
}

const format = function (ts) {
  return util.prettyTimeYMD(new Date(ts * 1000))
}