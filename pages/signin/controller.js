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

  api.getSignList().then( resp => {
    console.log( resp.data )
    var days = getDailySign(resp.data)
    view.setData({ sign: {
      days: days,
    }})

  }).catch( err => {
    console.log(err)
  })

  getDailySign()
}

function getDailySign(items) {
  var date = new Date();
  var weekDay = date.getDay();

  // day array
  var days = []
  for (var i = 0; i < 7; i++) {
    var d = new Date();
    d.setDate(date.getDate() - weekDay + i)
    days.push( {
      date: formatTime(d)
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
    } else {
      day.value = '+40'
    }
    day.date = day.date.substr(5)
  })
  return days
}

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


module.exports = {
  setup: setup,
  onLoad: onLoad,
}