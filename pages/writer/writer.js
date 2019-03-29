// pages/writer/writer.js
const ctr = require('./controller.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "",
    content: "",
  },
  bindTitle: function(e) {
    this.setData({title: e.detail.value})
  },
  bindContent: function(e) {
    this.setData({content: e.detail.value})
  },
  writerPublish: function() {
    ctr.onClickSubmit()
  },

  writerCancel: function() {
    wx.navigateBack({
      delta: 1
    })
  }
})