const api = require('api.js')
const app = getApp()

function getPhoneNumber(ecrypted, iv) {
  return new Promise((res, rej) => {
    wx.login({
      success: function (resp) {
        var data = {
          code: resp.code,
          data: ecrypted,
          iv: iv,
        }
        api.decrypt(data).then(resp => {
          res(resp.data)
        }).catch(err => {
          rej({code:2, err: err })
        })
      },
      fail: function (err) {
        rej({code: 1, err: err})
      }
    })
  })
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

// get meta-data
function getMetaData(fn) {
  api.getMetaData().then(resp => {
    var data = {
      app_logo: resp.data.app_logo,
      app_cover: resp.data.app_cover,
      app_name: resp.data.app_name,
      app_summary: resp.data.app_summary,
      app_pubtitle: resp.data.app_pubtitle,
      app_publink: resp.data.app_publink,
      app_copyright: resp.data.app_copyright,
      user_mode: 0,
      app_exp_limit: 0,
      app_signin: resp.data.app_signin,
      app_shareimg: resp.data.app_shareimg,
      app_video: resp.data.app_video,
    }
    if (resp.data.user_mode) {
      data.user_mode = parseInt(resp.data.user_mode, 10)
    }
    if (resp.data.app_exp_limit) {
      data.app_exp_limit = parseInt(resp.data.app_exp_limit, 10)
    }

    if (fn) {
      fn(data)
    }
  })
}

// 签到/私信/发帖/评论是写操作，需要用户绑定昵称
function isUserHasName(warning) {
  if (app.globalData.userInfo && app.globalData.userInfo.nickname) {
    return true
  }

  if (app.globalData.meta && app.globalData.meta.user_mode == 2) {
    wx.navigateTo({
      url: '/pages/me/bind',
    })
  } else {
    wx.navigateTo({
      url: `/pages/me/simp`,
    })
  }
}

module.exports = {
  getPhoneNumber: getPhoneNumber,
  getGrade: getGrade,
  getMetaData: getMetaData,
  isUserHasName: isUserHasName,
}