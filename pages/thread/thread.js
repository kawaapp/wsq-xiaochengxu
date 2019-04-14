// pages/post/posts.js
const ctr = require('./controller.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: {
      idx: null,
      post: {},
    },
    comments: [],
    loader: {
      ing: false,
      more: true,
    },
    reply: {
      index: -1,
      hint: "",
      text: "",
      enable: true,
      focus: false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    ctr.setup(this)
    ctr.onLoad(options)
  },
  onPullDownRefresh: function(e) {
    ctr.onPullDownRefresh(e)
  },
  onReachBottom: function(e) {
    ctr.onReachBottom(e)
  },
  clickMenu: function (e) {
    ctr.onClickMenu(e)
  },
  bindInput: function(e) {
    this.data.reply.text = e.detail.value
  },
  clickMask: function(e) {
    this.setData({
      reply: {
        focus: false,
        index: -1,
        hint: "",
      },
    })
    console.log("focus set false..")
  },
  clickReply: function(e) {
    this.setData({reply:{focus: true}})
  },
  clickFavor: function(e) {
    ctr.onClikcFavorPost(e)
  },
  threadCancel: function(e) {
    wx.navigateBack({ delta: 1})
  },
  clickListComment: function(e) {
    ctr.onClickListComment(e)
  },
  clickListFavor: function(e) {
    ctr.onClickListFavor(e)
  },
  sendComment: function (e) {
    ctr.onClickSendComment(e)
  }
})
