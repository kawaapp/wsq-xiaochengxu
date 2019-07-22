const ctr = require('./controller.js')
const kawa = require('../../kawa.js')
const util = require('../../utils/util.js')

var bgColor = util.lightenColor(kawa.Theme.MainColor, 10)
var fgColor = util.invertColor(bgColor, true)

// pages/signin/signin.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: {
      bgColor: bgColor,
      fgColor: fgColor,
    },
    user: {
      joinDays: 0, 
    },
    grades:[
    ],
    kinds: [
    ],
    usrGrade: {
    },
    next: {
      grade: {},
      percent: 0,
    }
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})