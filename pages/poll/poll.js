import api from '../../utils/api.js'
import util from '../../utils/util.js'
import biz from '../../utils/biz.js'
const kawa = require('../../kawa.js')
const app = getApp()

Page({

  // 页面的初始数据
  data: {
    theme: {
      color: kawa.Theme.MainColor,
    }, 
    poll: {
    },
    hideResult: true,
    showDetail: false, 
  },

  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    // 模拟新用户的场景
    // if (options.shared) {
    //   try {
    //     wx.removeStorageSync('token')
    //   } catch (e) { }
    // }
    const setup = () => {
      api.getPoll(options.id).then(resp => {
        this.setData({ poll: massage(resp.data) })
      }).catch(err => {
        console.log("get poll err:", err)
        wx.showToast({
          title: '打开投票失败:' + err.code, icon: 'none', duration: 2000,
        })
      })
    }
    if (!options.shared) {
      setup(); return
    }

    // shared, login first
    api.autoAuth().then(() => {
      setup()
    }).catch((err) => {
      if (biz.accessNotAllowed(err)) {
        wx.reLaunch({
          url: '/pages/login/login?man=true&private=true',
        })
        return
      }
      wx.showToast({
        title: '打开投票失败:' + err.code, icon: 'none', duration: 2000,
      })
    })
  },

  // 用户点击右上角分享
  onShareAppMessage: function () {
    const { poll } = this.data
    return {
      title: poll.title,
      path: `/pages/poll/poll?shared=true&id=${poll.id}`,
      imageUrl: poll.poster,
    }
  },

  clickDetail: function() {
    this.setData({ showDetail: true })
  },

  clickClose: function() {
    this.setData({ showDetail: false })
  },

  clickVote: function(e) {
    const i = e.currentTarget.dataset.i
    const data = {
      poll_id: this.data.poll.id,
      user_id: app.globalData.userInfo.id,
      choice: i,
    }
    console.log("click vote..", data)
    api.createVote(data).then( resp => {
      this.setData({ poll: massage(resp.data) })
      wx.showToast({
        title: '投票成功!'
      })
    }).catch(err => {
      console.log("poll err:", err)
      wx.showToast({ title: mapError(err), icon: 'none' })
    })
  }
})

function mapError(err) {
  var text = "投票失败!"
  if (err.err && err.err.includes("expired")) {
    text = '投票已经结束了!'
  } else if (err.err && err.err.includes("start")) {
    text = '投票还没有开始!'
  } else if (err.code === 403) {
    text = '已经投过票了!'
  }
  return text
}

function massage(poll) {
  const total = poll.vote_count || 1
  var options = poll.options
  var i = 0, n = options.length
  for (; i < n; i++) {
    if (poll.secret && !poll.voted) {
      options[i].percent = 0
      options[i].count = ''
    } else {
      options[i].percent = Math.round(options[i].count * 100 / total)
    }
  }
  if (poll.secret && !poll.voted) {
    poll.user_count = "NA"
    poll.vote_count = "NA"
  }
  const format = function(ts) {
    return util.prettyTimeYMD(new Date(ts * 1000))
  }
  poll.start = format(poll.started_at)
  poll.expire = format(poll.expired_at)
  return poll
}