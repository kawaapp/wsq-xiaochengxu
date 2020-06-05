const ctr = require('./controller.js')
const kawa = require('../../kawa.js')
const biz = require('../../utils/biz.js')

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
    showSub: false,
  },

  onLoad: function(options) {
    biz.applyTheme(kawa.Theme)
    ctr.setup(this)
    ctr.onLoad(options)
  },

  onUnload: function () {
    ctr.onUnload()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    ctr.refreshMessage()
  },

  onHide: function() {
    ctr.refreshMessage()
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
  },

  // 消息订阅
  clickSubscribe: function(e) {
    ctr.onClickSubscribe(e)
  }
})
