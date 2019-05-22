const ctr = require('./controller.js') 
const kawa = require('../../kawa.js')

// pages/me/me.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: kawa.Theme.Image,
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
    ctr.setup(this)
    ctr.onLoad(options)
  },
  bindUserInfo: function (e) {
    ctr.bindUserInfo(e)
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