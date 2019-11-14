const ctr = require('./controller.js')
const kawa = require('../../../kawa.js')

// pages/user/user.js
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
    posts: [],
    loading: false,
    hasmore: true,
    follow: false,
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

  onReachBottom: function(e) {
    ctr.onReachBottom()
  },

  clickItem: function(e) {
    ctr.onClickItem(e)
  },

  clickFollow: function(e) {
    ctr.onClickFollow(e)
  }
})