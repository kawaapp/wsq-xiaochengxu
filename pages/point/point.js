const ctr = require('./controller.js')
const kawa = require('../../kawa.js')
const util = require('../../utils/util.js')

var bgColor = util.lightenColor(kawa.Theme.MainColor, 10)
var fgColor = util.invertColor(bgColor, true)

Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: {
      bgColor: bgColor,
      fgColor: fgColor,
    },
    point: 10,
    items: [{
      title: "小米头像框",
      value: 100,
      image: "https://images.kawaapp.com/img_bobh6vkdbfdqidk67gp0.gif",
    }, {
        title: "小米头像框",
        value: 100,
        image: "https://images.kawaapp.com/img_bkaqqgkdbfdqfm68takg.jpeg",
      }
    ],
    target: {
      title: "小米头像框",
      value: 100,
      image: "https://images.kawaapp.com/img_bobh6vkdbfdqidk67gp0.gif",
    },
    kinds: [{name: "签到", value: 10}, {name: "发帖", value: 15}],
    show: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  clickHistory: function() {
    wx.navigateTo({
      url: "/pages/point/history/history",
    })
  },

  clickBuy: function() {
    this.setData({ show: true })
  },
  
  clickClose: function() {
    this.setData({ show: false })
  }
})