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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    api.getMessageCount().then( (resp) => {
      // if (resp.statusCode == 200) {
      //   this.setData({count: resp.data})
      // }
      // console.log("get message count:", resp)
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  // 点击点赞消息按钮
  favorClick: function() {

  },

  // 点击评论消息按钮
  commentClick: function() {
    
  }
})