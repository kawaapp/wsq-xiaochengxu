//logs.js
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

Page({
  data: {
    topics: [
      {
        author: {
          name: '小虾米',
          avatar: '',
          ts: 1548571746979,
        },
        stats: {
          comment: 1,
          like: 0
        },
        text: '小虾米 啦啦啦',
        imgs:[],
      },
      {
        author: {
          name: '小虾米',
          avatar: '',
          ts: 1548571746979,
        },
        stats: {
          comment: 1,
          like: 0
        },
        text: '小虾米 啦啦啦',
        imgs: [],
      }
    ]
  },
  onLoad: function () {
    //
    // api.getTopicList().then( resp =>{
    //   if (resp.statusCode == 200) {
    //     this.setData({
    //       topics: resp.data
    //     })
    //   }
    // }).catch(err => {
    //   console.log("topic", err)
    // })
  },
  onResult: function(data) {
    console.log('refresh current page...')
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
  },
  topicFavor: function(e) {
    var idx = e.currentTarget.dataset.name
    console.log("idx:", idx)
    var post = this.data.topics[idx]
    api.createPostFavor(post.id).then((resp) => {
      if (resp.statusCode == 200) {
        post.stats.like += 1
      }
    })
  },
})