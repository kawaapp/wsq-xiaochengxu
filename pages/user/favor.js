const api = require('../../utils/api.js')

// pages/me/list/favor.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    favors: [
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
    api.getUserFavorList(this.data.user.uid).then(resp => {
      console.log("user get favor:", resp)
      this.setData({ favors: resp.data })
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    api.getUserFavorList(this.data.user.uid).then(resp => {
      this.setData({ favors: resp.data })
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loader.ing || !this.data.loader.more) {
      return
    }
    var favors = this.data.posts
    var since = 0
    var limit = 20
    if (favors && favors.length > 0) {
      since = favors[favors.length - 1].id
    }
    api.getUserFavorList(this.data.user.uid, since, limit).then(resp => {
      if (esp.data.length < limit) {
        this.data.loader.more = false
      }
      this.setData({ favors: favors.concat(resp.data) })
    })
  },
})