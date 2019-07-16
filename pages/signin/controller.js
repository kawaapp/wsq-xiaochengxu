const api = require('../../utils/api.js')
const util = require('../../utils/util.js')


const app = getApp()

var view = undefined
function setup(_view) {
  view = _view
}

function onLoad(options) {
  var user = app.globalData.userInfo
  view.setData({user: user})

  // show sign-in days
  api.getSignList().then( resp => {
    var days = getDailySign(resp.data)
    var weekDay = new Date().getDay()
    var today = days[weekDay]

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
}

// 签到规则：连续签到三次之后，再次签到+10
function getDailySign(items) {
  var date = new Date();
  var weekDay = date.getDay();

  console.log("get week day:", weekDay)

  // day array
  var days = []
  for (var i = 0; i < 7; i++) {
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

  var last = {
    seq_count: 0,
  }

  console.log(days)

  // 先算连续签到次数，过去的天数中，签到是已知的
  // 未来按已经签到算
  // 再根据签到次数得到每日经验

  // compute exp
  for (var i = 0; i < 7; i++) {
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

  return days
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

function massage(items) {
  items.map( item => {
    item.avatar = 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
  })
  return items
}

function onReachBottom() {
  console.log("on reach bottom..")
  if (view.data.loader.ing || !view.data.loader.more) {
    return
  }
  var ranks = view.data.ranks
  var pager = view.data.pager
  var loader = view.data.loader
  loader.ing = true
  view.setData({ loader: loader })

  api.getSignUserList(pager.index+1, pager.limit).then(resp => {
    loader.ing = false
    if (resp.data.length < limit) {
      loader.more = false
    }
    pager.index += 1
    view.setData({ loader: loader })
    view.setData({ ranks: ranks.concat(resp.data) })

    console.log("get users:", resp.data)
  }).catch(err => {
    loader.ing = false
    view.setData({ loader: loader })
    wx.showToast({
      title: '加载失败', icon: 'none',
    })
  })
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onReachBottom: onReachBottom,
}