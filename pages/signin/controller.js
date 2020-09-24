const api = require('../../utils/api.js')

const app = getApp()

var view = undefined
function setup(_view) {
  view = _view
}
function onUnload() {
  view = undefined
}

function onLoad(options) {
  wx.setNavigationBarColor({
    frontColor: '#ffffff',
    backgroundColor: view.data.theme.signColor,
  })
  var user = app.globalData.userInfo
  view.setData({user: user})

  // show sign-in days
  api.getSignList().then( resp => {
    var days = resp.data
    var weekDay = new Date().getDay()
    if (weekDay == 0) {
      weekDay = 7
    }
    var today = days[weekDay-1]
    today.today = true
    today.date = '今天'

    // 连续签到, 如果今天已签到那么连续签到次数记录在今天否则是昨天
    var seqCount = 0
    if (today.checked) {
      seqCount = today.seq_count
    } else {
      seqCount = weekDay-2>=0? days[weekDay-2].seq_count: 0
    }

    view.setData({
      sign: { days: days, today: today, seqCount: seqCount }
    })
  }).catch( err => {
    console.log(err)
  })

  var pager = view.data.pager
  // get ranking list
  api.getSignUserList(pager.index, pager.limit).then( resp => {
    view.setData({
      ranks: massage(resp.data)
    })
  }).catch(err => {
    console.log(err)
  })
}

function onReachBottom() {
  if (view.data.loading || !view.data.hasmore) {
    return
  }
  var ranks = view.data.ranks
  var pager = view.data.pager
  view.setData({ loading: true })

  api.getSignUserList(pager.index+1, pager.size).then(resp => {
    pager.index += 1
    view.setData({ loading: false, hasmore: resp.data && resp.data.length == pager.size  })
    view.setData({ ranks: ranks.concat(massage(resp.data)) })
  }).catch(err => {
    console.log(err)
    view.setData({ loading: false })
    wx.showToast({
      title: '加载失败:'+err.code, icon: 'none',
    })
  })
}

function onClickSign(e) {
  var sign = view.data.sign
  if (sign.today.checked) {
    wx.showToast({
      title: '已经签过到啦', icon: 'none'
    })
    return
  }
  // 执行签到
  api.signin().then(resp => {
    view.setData({ signed: true })
    if (resp.data.code == 4001) {
      wx.showToast({
        title: '已签到', icon: "success"
      })
    } else {
      wx.showToast({
        title: '签到成功', icon: "success"
      })
    }
    // 刷新签到列表
    refresh()
  }).catch(err => {
    console.log(err)
    wx.showToast({ title: '签到失败:'+err.code, icon: "none" })
  })
}

// 刷新
function refresh() {
  onLoad()
}

// show users who has a name
function massage(items) {
  if (!items) {
    return []
  }
  var users = []
  var n = items.length
  for (var i = 0; i < n; i++) {
    if (items[i].nickname) {
      users.push(items[i])
    }
  }
  return users
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onReachBottom: onReachBottom,
  onClickSign: onClickSign,
}