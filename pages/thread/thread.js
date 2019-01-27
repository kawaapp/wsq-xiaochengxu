// pages/post/posts.js
import api from '../../utils/api.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    topic: {
      id: 0,
      author: {
        name: '小虾米',
        avatar: '',
        ts: 1548571746979
      },
      text: '小虾米啦啦啦',
      imgs:[],
    },
    comments: [
      {
        author: {
          name: '小虾米',
          avatar: '',
          ts: 1548571746979
        },
        text: '小虾米啦啦啦 \n 小虾米啦啦啦 \n 小虾米啦啦啦 小虾米啦啦啦 \n 小虾米啦啦啦 \n 小虾米啦啦啦 小虾米啦啦啦 \n 小虾米啦啦啦 \n 小虾米啦啦啦',
      },
      {
        author: {
          name: '小虾米',
          avatar: '',
          ts: 1548571746979
        },
        text: '小虾米啦啦啦',
      }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    api.getCommentList(this.data.topic.id).then(resp => {
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