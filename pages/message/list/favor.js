const api = require('../../../utils/api.js')

// pages/message/list/favor.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    messages: [],
    loader: {
      ing: false,
      more: true,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    api.getMessageList('favor').then( resp => {
      this.setData({ messages: resp.data})
      console.log("get favor message list:", resp.data)
    }).catch( err => {
      console.log(err)
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    api.getMessageList('favor').then(resp => {
      this.setData({ messages: resp.data })
    }).catch(err => {
      console.log(err)
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loader.ing || !this.data.loader.more) {
      return
    }
    var messages = this.data.messages
    var since = 0
    var limit = 20
    if (messages && messages.length > 0) {
      since = messages[messages.length - 1].id
    }
    api.getMessageList('favor', since, limit).then(resp => {
      if (esp.data.length < limit) {
        this.data.loader.more = false
      }
      this.setData({ messages: messages.concat(resp.data) })
    })
  },
})