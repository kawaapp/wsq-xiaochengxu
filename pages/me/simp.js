const kawa = require('../../kawa.js')
const api = require('../../utils/api.js')
const app = getApp()

// pages/me/bind2.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: {
      images: kawa.Theme.Image,
      color: kawa.Theme.MainColor,
    },
    user: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  bindUserInfo(e) {
    var user = e.detail.userInfo
    var view = this
    if(user) {
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
  },

  clickCancel: function() {
    wx.navigateBack({ delta: 1 })
  }
})