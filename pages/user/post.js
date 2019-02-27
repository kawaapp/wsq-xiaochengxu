const api = require('../../utils/api.js')

// pages/me/list/post.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    posts: [],
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
    api.getUserPostList(this.data.user.uid).then( resp => {
      console.log("user get posts:", resp)
      this.setData({posts: resp.data})
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    api.getUserPostList(this.data.user.uid).then(resp => {
      this.setData({ posts: resp.data })
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loader.ing || !this.data.loader.more) {
      return
    }
    var posts = this.data.posts
    var since = 0
    var limit = 20
    if (posts && posts.length > 0) {
      since = posts[posts.length-1].id
    }
    api.getUserPostList(this.data.user.uid, since, limit).then( resp => {
      if (resp.data.length < limit) {
        this.data.loader.more = false
      }
      this.setData({ posts: posts.concat(resp.data)})
    })
  },
})