//logs.js
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

// topics:[
// {
//   author: {
//     name: '小虾米',
//     avatar: '',
//     ts: 1548571746979,
//   },
//   stats: {
//     comment: 1,
//       like: 0
//   },
//   text: '小虾米 啦啦啦',
//   imgs: [],
// },....]
Page({
  data: {
    posts: []
  },
  onLoad: function () {
    //
    api.getTopicList().then( resp =>{
      if (resp.statusCode == 200) {
        this.setData({
          posts: resp.data
        })
      }
    }).catch(err => {
      console.log("topic", err)
    })
  },
  // 从其它页面返回数据
  onResult: function(data) {
    if (data && data.ok && data.req == 'newpost') {
      // data.post
      // 新增帖子到列表头部
    }
    console.log('home, on result data:' + data)
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
      api.getTopicList().then((resp) => {
        wx.stopPullDownRefresh()
        if (resp.statusCode == 200) {
          // 
          this.setData({
            posts: resp.data
          })
        }

      }).catch((err) => {
        wx.stopPullDownRefresh()
        console.log(err)
      })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

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