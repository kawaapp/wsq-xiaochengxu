const api = require('../../utils/api.js')
const app = getApp()

// pages/me/me.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {
      avatar: '',
      nickname: '小虾米',
      summary: '啦啦啦 我是卖报的小行家',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    api.getSelf().then( (resp) => {
      app.globalData.userInfo = resp.data
      this.setData({ user: resp.data})
      console.log("get user data:", resp.data)
    })
  },
  bindUserInfo: function (e) {
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
          this.setData({user: resp.data})
      })
    }
    console.log(e.detail)
  },
  postClick: function(e) {
    wx.navigateTo({
      url: '/pages/user/post',
    })
  },
  commentClick: function(e) {
    wx.navigateTo({
      url: '/pages/user/comment',
    })
  },
  favorClick: function(e) {
    wx.navigateTo({
      url: '/pages/user/favor',
    })
  }
})