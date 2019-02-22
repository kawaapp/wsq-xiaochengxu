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

  },
  login: function() {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})