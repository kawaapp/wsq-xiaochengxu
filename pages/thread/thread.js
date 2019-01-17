// pages/post/posts.js
import api from '../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    topic: {},
    comments: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    api.getCommentList(1).then(resp => {
      if (resp.statusCode == 200) {
        this.setData({
          comments: resp.data
        })
      }
    }).catch(err => {
      console.log('thread:', err)
    })
  },
  threadComment: function(e) {
    const data = {
      pid: 1,
      text: "啦啦啦"
    }
    api.createComment(data).then( resp => {

    }).catch(err => {
      
    })
  },
  threadCancel: function(e) {
    wx.navigateBack({ delta: 1})
  },
})