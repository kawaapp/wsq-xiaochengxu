const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

const app = getApp()

var view = undefined
function setup(_view) {
  view = _view
}

function onLoad(options) {
  var user = app.globalData.userInfo
  user.joinDays = util.getDaysFromNow(user.created_at)
  view.setData({ user: user })

  // 加载等级列表
  api.getGradeList().then(resp => {
    view.setData({grades: resp.data})
    // user grade
    var g = getGrade(user.exp)
    view.setData({usrGrade: g})
  }).catch(err => {
    console.log(err)
  })

  // 加载类型列表
  api.getExpKindList().then(resp => {
    view.setData({kinds: resp.data})
  }).catch(err => {
    console.log(err)
  })
}

function getGrade(exp) {
  var grades = view.data.grades
  if (!grades || grades.length == 0) {
    return
  } 
  grades.sort( (a, b) => {
    return a.level < b.level
  })
  for (var i = 0; i < grades.length; i++) {
    if (grades[i].need_exp > exp) {
      return grades[i]
    } 
  }
  return grades[grades.length-1]
}

function onReachBottom() {
  
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onReachBottom: onReachBottom,
}