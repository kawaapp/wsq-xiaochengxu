// pages/post/posts.js
const ctr = require('./controller.js')
const kawa = require('../../kawa.js')
const util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: {
      images: kawa.Theme.Image,
      favorColor: kawa.Theme.FavorColor || kawa.Theme.MainColor,
      color: kawa.Theme.MainColor,
    },
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
  onUnload: function() {
    ctr.onUnload()
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
  clickMenu: function (e) {
    ctr.onClickMenu(e)
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
  sendComment: function (e, op) {
    ctr.onClickSendComment(e)
  }, 
  clickListCommentAction: function(e) {
    ctr.onClickListCommentAction(e)
  },

  clickPostAvatar: function (e) {
    var post = this.data.item.post
    if (post) {
      gotoUserPage(post.author)
    }
  },

  clickCommentAvatar: function(e) {
    var idx = e.currentTarget.dataset.idx
    var comment = this.data.comments[idx]
    if (comment) {
      gotoUserPage(comment.author)
    }
  },
})

function gotoUserPage(user) {
  if (user) {
    util.sendRequest('user', {
      data: user,
    })
    wx.navigateTo({
      url: '/pages/user/user',
    })
  } else {
    wx.showToast({
      title: '用户不存在', icon: 'none'
    })
  }
}
