const ctr = require('./controller.js')
const kawa = require('../../../kawa.js')

// pages/user/user.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: {
      images: kawa.Theme.Image
    },
    user: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    ctr.setup(this)
    ctr.onLoad(options)
  },

  onUnload: function() {
    ctr.onUnload()
  },

  clickSendMessage: function(e) {
    ctr.onClickSend(e)
  },

  onPullDownRefresh: function(e) {
    ctr.onPullDownRefresh()
  },

  onReachBottom: function(e) {
    ctr.onReachBottom()
  }
})