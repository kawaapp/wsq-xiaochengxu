const ctr = require('./comment_ctr.js')
const kawa = require('../../../kawa.js')

// pages/message/list/comment.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: {
      images: kawa.Theme.Image,
    },
    messages: [],
    loading: false,
    hasmore: true,
    unread: 0,
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    ctr.onPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    ctr.onReachBottom()
  },
  clickItem: function (e) {
    ctr.onClickItem(e)
  },
})

