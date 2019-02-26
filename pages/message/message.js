const api = require('../../utils/api.js')

// pages/message/message.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count: {
      favors: 10,
      comments: 1,
    },
    list:[]
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    refreshMessage(this)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    refreshMessage(this)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

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
  }
})

function refreshMessage(p) {
  api.getMessageCount().then((resp) => {
    if (resp.statusCode == 200) {
      p.setData({ count: resp.data })
    }
    console.log("get message count:", resp)
  })
}