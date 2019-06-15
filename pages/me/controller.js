const api = require('../../utils/api.js')
const biz = require('../../utils/biz.js')
const app = getApp()

var view = undefined
function setup(_view) {
  view = _view
}

function onLoad(options) {
  const user = app.globalData.userInfo
  if (user) {
    view.setData({ user: user })
  }
  const meta = app.globalData.meta
  if (meta && meta.app_copyright) {
    view.setData({ copyright: meta.app_copyright })
  }
  if (meta && meta.user_mode) {
    view.setData({
      metadata: { user_mode: meta.user_mode }
    })
  }
  if (meta && (meta.app_support === 'false')) {
    view.setData({ support: false })
  }
  // update 
  api.getSelf().then((resp) => {
    app.globalData.userInfo = resp.data
    view.setData({ user: resp.data })
    console.log("get user data:", resp.data)
  })
}

// refresh page
function onResult(data) {
  const user = app.globalData.userInfo
  if (user) {
    view.setData({ user: user })
  }
}

function bindUserInfo(e) {
  var user = e.detail.userInfo
  if (user) {
    var data = {
      avatar: user.avatarUrl,
      city: user.city,
      gender: user.gender,
      language: user.language,
      nickname: user.nickName
    }
    api.updateUser(data).then((resp) => {
      console.log("授权成功")
      app.globalData.userInfo = resp.data
      view.setData({ user: resp.data })
    })

    // save in localStorage, and refresh when lauch
    wx.setStorage({
      key: 'user',
      data: data,
    })
  }
  console.log(e.detail)
}

function getPhoneNumber(e) {
  var ecrypted = e.detail.encryptedData
  var iv = e.detail.iv
  if (ecrypted && iv) {
    biz.getPhoneNumber(ecrypted, iv).then( data => {
      if(!data.purePhoneNumber) {
        wx.showToast({ title: '会话过期，请重试', icon: 'none' })
        return
      }
      var user = app.globalData.userInfo
      user.phone = data.purePhoneNumber
      view.setData({ user: user})
      wx.setStorage({
        key: 'user',
        data: user,
      })
      api.updateUser(user).then(resp => {
        console.log('update user.phone success')
      })
    }).catch(err => {
      if (err.code && err.code == 2) {
        wx.showToast({ title: '手机号解密失败', icon: 'none' })
      } else {
        wx.showToast({ title: '绑定手机号失败', icon: 'none' })
      }
      console.log(err)
    })
  } else {
    wx.showToast({title: '绑定手机号失败:0', icon: 'none'})
  }
}

module.exports =  {
  setup: setup,
  onLoad: onLoad,
  bindUserInfo: bindUserInfo,
  getPhoneNumber: getPhoneNumber,
  onResult: onResult,
}