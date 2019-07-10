import api from '../../utils/api.js'
import util from '../../utils/util.js'

// pages/user/user.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var req = util.getRequest("user")
    var user = req.data
    user.days = getDays(user.created_at)
    this.setData({ user: user})
  },

  clickSendMessage: function(e) {
    wx.navigateTo({
      url: '/pages/chat/chat',
    })
  }
})

function getDays(created_at) {
  var thatTime = new Date(created_at * 1000)
  var nowTime = new Date()
  return Math.floor((nowTime - thatTime)/(1000 * 3600 * 24))
}