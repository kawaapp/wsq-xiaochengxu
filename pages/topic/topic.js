//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    topics: [{
      message: 'foo',
    }, {
      message: 'bar'
    }]
  },
  onLoad: function () {
    //


    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
  },
  newTopic: function(e) {
    wx.navigateTo({
      url: '/pages/writer/writer',
    })
  },
  topicClick: function(e) {
    var idx = e.currentTarget.dataset.name;
    console.log("idx:", idx);
    wx.navigateTo({
      url: '/pages/thread/thread',
    })
  }
})