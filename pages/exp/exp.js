const ctr = require('./controller.js')

// pages/signin/signin.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {
      joinDays: 0,
    },
    grades:[
    ],
    kinds: [
    ],
    usrGrade: {
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    ctr.setup(this)
    ctr.onLoad(options)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})