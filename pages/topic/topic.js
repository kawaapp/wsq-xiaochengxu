//logs.js
const api = require('../../utils/api.js')

Page({
  data: {
    topics: []
  },
  onLoad: function () {
    //
    api.getTopicList().then( resp =>{
      if (resp.statusCode == 200) {
        this.setData({
          topics: resp.data
        })
      }
    }).catch(err => {
      console.log("topic", err)
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