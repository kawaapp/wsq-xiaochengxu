import api from '../../utils/api.js'
import util from '../../utils/util.js'
import biz from '../../utils/biz.js'

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
    user.days = util.getDaysFromNow(user.created_at)
    this.setData({ user: user})
  },

  clickSendMessage: function(e) {
    if (!biz.isUserHasName('需要绑定微信昵称，才能发私信')) {
      return
    }
    var user = this.data.user
    util.sendRequest('user', user)
    wx.navigateTo({
      url: '/pages/chat/chat?uid=' + user.id,
    })
  }
})