const ctr = require('./controller.js')
const kawa = require('../../kawa.js')
const util = require('../../utils/util.js')

const app = getApp()

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
    user: {},
    items: [],
    target: {
      index: -1,
      item: {},
    },
    kinds: [],
    show: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    ctr.setup(this)
    ctr.onLoad(options)
  },

  clickHistory: function() {
    wx.navigateTo({
      url: "/pages/point/history/history",
    })
  },

  clickBuy: function(e) {
    var idx = e.currentTarget.dataset.idx
    this.setData({ show: true, target: {
      index: idx,
      item: this.data.items[idx]
    }})
  },
  
  clickClose: function() {
    this.setData({ show: false, target: {} })
  },

  clickExch: function() {
    ctr.exchange(this.data.target)
  }
})