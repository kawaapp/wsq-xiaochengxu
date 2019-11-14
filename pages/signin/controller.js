const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const kawa = require('../../kawa.js')


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

  try {
    var expTypes = wx.getStorageSync('exp-types')
    if (expTypes) {
      var exp = getSignExpValue(expTypes)
      view.setData({ exp: exp})
    }
  } catch (e) {
    // Do something when catch error
  }

  // show sign-in days
  api.getSignList().then( resp => {
    var days = getDailySign(resp.data)
    var weekDay = new Date().getDay()
    if (weekDay == 0) {
      weekDay = 7
    }
    var today = days[weekDay-1]

    view.setData({
      sign: { days: days, today: today }
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

  // 取得服务器经验值配置
  api.getExpKindList().then( resp => {
    var exp = getSignExpValue(resp.data)
    view.setData({exp: exp})

    // 重新显示列表
    var sign = view.data.sign
    sign.days.map( d => {
      if (d.seq_count == 0) {
        d.value = 0
      } else if (d.seq_count <= 3) {
        d.value = exp.sign
      } else {
        d.value = exp.seq
      }
    })
    view.setData({sign: sign})

    // save local
    wx.setStorage({
      key: 'exp-types', data: exp,
    })
  }).catch( err => {
    console.log(err)
  })
}

function getSignExpValue(types) {
  var sign = 1, seq = 2
  types.map( t => {
    if (t.type == 5) {
      sign = t.value
    } else if (t.type == 6) {
      seq = t.value
    }
  })
  return {sign: sign, seq: seq}
}

// 签到规则：连续签到三次之后，再次签到+10
function getDailySign(items) {
  var date = new Date();
  var weekDay = date.getDay();
  if ( weekDay == 0) {
    weekDay = 7
  }

  console.log("get week day:", weekDay)

  // day array, days[0] = last weekend
  var days = []
  for (var i = 0; i < 8; i++) {
    var d = new Date();
    d.setDate(date.getDate() - weekDay + i)
    days.push( {
      date: formatTime(d),
      index: i,
    })
  }

  // sign mapping
  var mapping = {}
  if (items) {
    items.map( item => {
      mapping[item.date] = item
    })
  }

  // link data
  days.map( day => {
    var sign = mapping[day.date]
    if (sign) {
      day.signed = true
      day.seq_count = sign.seq_count
    } else {
      day.sign = false
      day.seq_count = 0
    }
    if (day.index == weekDay) {
      day.date = '今天'
      day.today = true
    } else {
      day.date = day.date.substr(5)
    }
  })

  var last = days[0]

  console.log(days)

  // 先算连续签到次数，过去的天数中，签到是已知的
  // 未来按已经签到算
  // 再根据签到次数得到每日经验

  // compute exp
  for (var i = 1; i < 8; i++) {
    if (i >= weekDay) {
      days[i].seq_count = last.seq_count + 1
    }
    if (days[i].seq_count == 0) {
      days[i].value = 0
    } else if (days[i].seq_count <= 3) {
      days[i].value = 30
    } else {
      days[i].value = 40
    }
    last = days[i]
  }

  return days.slice(1)
}

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function onReachBottom() {
  console.log("on reach bottom..")
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
    console.log("get users:", resp.data)
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
  if (sign.today.signed) {
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
  }).catch(err => {
    console.log(err)
    wx.showToast({ title: '签到失败:'+err.code, icon: "none" })
  })
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