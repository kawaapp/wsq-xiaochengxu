const api = require('../../utils/api.js')

// pages/me/list/comment.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    comments: [
      {
        text: "啦啦啦"
      }
    ],
    user: {
      uid: 0,
    },
    loader: {
      ing: false,
      more: true,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options && options.uid) {
      this.data.user.uid = options.uid
    }
    api.getUserCommentList(this.data.user.uid).then(resp => {
      this.setData({ comments: resp.data })
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    api.getUserCommentList(this.data.user.uid).then(resp => {
      this.setData({ comments: resp.data })
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loader.ing || !this.data.loader.more) {
      return
    }
    var comments = this.data.comments
    var since = 0
    var limit = 20
    if (comments && comments.length > 0) {
      since = comments[comments.length - 1].id
    }
    api.getUserCommentList(this.data.user.uid, since, limit).then(resp => {
      if (resp.data.length < limit) {
        this.data.loader.more = false
      }
      this.setData({ comments: comments.concat(resp.data) })
    })
  }
})