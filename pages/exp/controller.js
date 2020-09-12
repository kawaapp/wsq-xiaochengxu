const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const biz = require('../../utils/biz.js')

const app = getApp()

var view = undefined
function setup(_view) {
  view = _view
}
function onUnload() {
  view = undefined
}

function onLoad(options) {
  var theme = view.data.theme
  wx.setNavigationBarColor({
    frontColor: theme.fgColor,
    backgroundColor: theme.bgColor,
  })

  var user = app.globalData.userInfo
  user.joinDays = util.getDaysFromNow(user.created_at)
  view.setData({ user: user })

  var grades = app.globalData.grades
  var i = getGrade(grades, user.exp_count)
  view.setData({ usrGrade: grades[i]})
  view.setData({ grades: grades })

  var next = {}
  if (i+1 >= grades.length) {
    next.percent = 100
    next.label = '已达最高级'
  } else {
    next.percent = (user.exp_count - grades[i].need_exp) * 100 /grades[i+1].need_exp
    next.percent = Math.round(next.percent)
    next.label = '下一个等级，' + 'Lv' + grades[i+1].level + ' ' + grades[i+1].show_name
  }
  view.setData({
    next: next,
  })

  // 加载类型列表
  api.getExpKindList().then(resp => {
    view.setData({kinds: resp.data})
  }).catch(err => {
    console.log(err)
  })
}


function onReachBottom() {
  
}

// 最低级别需要经验应该为 0 
// 否则初始的时候无法获得等级
function getGrade(grades, exp) {
  if (!grades || grades.length == 0) {
    return
  }

  // 从小到大排列
  grades.sort((a, b) => {
    return a.level > b.level
  })

  // 遇到第一个满足条件的等级时退出
  // 得到当前对应的等级
  for (var i = grades.length-1; i >= 0; i--) {
    if (exp >= grades[i].need_exp) {
      return i
    }
  }
  return
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onReachBottom: onReachBottom,
}