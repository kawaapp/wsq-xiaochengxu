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
    votes: {
    },
  },

  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    // 模拟新用户的场景
    // if (options.shared) {
    //   try {
    //     wx.removeStorageSync('token')
    //   } catch (e) { }
    // }
    if (!options.shared) {
      firstLoad(this, options.id); return
    }

    // shared, login first
    api.autoAuth().then(() => {
      firstLoad(this, options.id);
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
    api.logShare({ type: 'share-poll' })
    // biz
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
    const { poll, votes } = this.data
    
    const params = {
      poll_id: poll.id,
      choice: i,
    }
    
    // 多选取消
    if (poll.multiple && votes[i]) {
      voteCancel(this, params)
    }

    // 多选选择
    if (poll.multiple && !votes[i]) {
      voteSummit(this, params)
    }

    // 单选重选
    if (!poll.multiple && votes[i]) {
      // ignore
    }

    // 单选选择
    if (!poll.multiple && !votes[i]) {
      voteRevote(this, params)
    }
  }
})

function firstLoad(view, id) {
  // get poll
  api.getPoll(id).then( resp => {
    view.setData({ poll: massage(resp.data) })
  }).catch(err => {
    console.log("get poll err:", err)
    wx.showToast({
      title: '打开投票失败:' + err.code, icon: 'none', duration: 2000,
    })
  })

  // get vote
  api.getUserVote(id).then( resp => {
    view.setData({ votes : getResult(resp.data) })
  })
}

function voteSummit(view, params) {
  wx.showLoading({
    title: '',
  })
  api.voteSubmit(params).then( resp => {
    var { votes } = view.data
    votes[params.choice] = true
    console.log("get votes result:", resp.data)
    view.setData({ poll: massage(resp.data), votes})
    wx.showToast({ title: '投票成功!' })
  }).catch(err => {
    console.log("poll err:", err)
    wx.showToast({ title: mapError(err), icon: 'none' })
  })
}

function voteCancel(view, params) {
  api.voteCancel(params).then( resp => {
    var { votes } = view.data
    votes[params.choice] = false
    view.setData({ poll: massage(resp.data), votes})
    wx.showToast({ title: '取消成功!' })
  }).catch( err => {
    console.log("poll err:", err)
    wx.showToast({ title: mapError(err), icon: 'none' })
  })
}

// 先取消之前投票再投票
function voteRevote(view, params) {
  const { votes } = view.data
  const key = Object.keys(votes)[0]
  var handler = undefined
  if (key !== undefined) {
    handler = api.voteCancel({...params, choice: parseInt(key)}).then( () => {
      return api.voteSubmit(params)
    })
  } else {
    handler = api.voteSubmit(params)
  }
  handler.then( resp => {
    var votes = {}
    votes[params.choice] = true
    view.setData({ poll: massage(resp.data), votes })
    wx.showToast({ title: '投票成功!' })
  }).catch( err => {
    console.log("vote err", err)
    wx.showToast({ title: mapError(err), icon: 'none' })
  })
}

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

function getResult(data) {
  const array = data || []
  var votes = {}
  array.map( v => {
    votes[v.choice] = true
  })
  return votes
}