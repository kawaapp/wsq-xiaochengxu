const ctr = require('./controller.js')
const kawa = require('../../kawa.js')

// pages/message/message.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: {
      images: kawa.Theme.Image,
    },
    count: {
      favors: 0,
      comments: 0,
    },
    chats:[],
    loading: false,
    hasmore: true,
    timer: 0,
    refreshCounter: 1,
  },

  onLoad: function(options) {
    ctr.setup(this)
    const view = this
    const id = setInterval(function() {
      var counter = view.data.refreshCounter + 1
      view.setData({ refreshCounter: counter })
      if (counter > 10) {
        ctr.refreshMessage()
      }
    }, 6000);
    this.setData({ timer: id}) 
  },

  onUnload: function () {
    clearInterval(this.data.timer)
    ctr.onUnload()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.removeTabBarBadge({index: 1})
    wx.hideTabBarRedDot({index: 1})
    if (this.data.refreshCounter > 0) {
      ctr.refreshMessage()
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    ctr.refreshMessage()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    ctr.onReachBottom()
  },

  // 点击点赞消息按钮
  favorClick: function() {
    wx.navigateTo({
      url: '/pages/message/list/favor',
    })
  },

  // 点击评论消息按钮
  commentClick: function() {
    wx.navigateTo({
      url: '/pages/message/list/comment',
    })
  },

  clickItem: function(e) {
    ctr.onClickItem(e)
  }
})
