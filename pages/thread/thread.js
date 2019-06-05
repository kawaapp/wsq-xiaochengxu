// pages/post/posts.js
const ctr = require('./controller.js')
const kawa = require('../../kawa.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: kawa.Theme.Image,
    favorColor: kawa.Theme.FavorColor || kawa.Theme.MainColor,
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
      subindex: -1,
      hint: "",
      text: "",
      enable: true,
      focus: false
    },
    shared: false,
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
  onShareAppMessage: function (res) {
    return ctr.onClickShare(res)
  },
  clickImage: function(e) {
    ctr.onClickImage(e)
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
    ctr.onClickReplyPost(e)
  },
  clickFavor: function(e) {
    ctr.onClikcFavorPost(e)
  },
  threadCancel: function(e) {
    ctr.gotoHome()
  },
  clickListComment: function(e) {
    ctr.onClickListComment(e)
  },
  clickListFavor: function(e) {
    ctr.onClickListFavor(e)
  },
  sendComment: function (e) {
    ctr.onClickSendComment(e)
  }, 
  clickListCommentAction: function(e) {
    ctr.onClickListCommentAction(e)
  },
})
