const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

// pages/message/list/comment.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    messages: [],
    loader: {
      ing: false,
      more: true,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    api.getMessageList('comment').then( resp => {
      var unpacked = unpackMsgContent(resp.data)
      this.setData({ messages: unpacked})
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    api.getMessageList('comment').then(resp => {
      var unpacked = unpackMsgContent(resp.data)
      this.setData({ messages: unpacked })
      console.log(resp)
    }).catch(err => {
      console.log(err)
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loader.ing || !this.data.loader.more) {
      return
    }
    var messages = this.data.messages
    var since = 0
    var limit = 20
    if (messages && messages.length > 0) {
      since = messages[messages.length - 1].id
    }
    api.getMessageList('favor', since, limit).then(resp => {
      if (resp.data.length < limit) {
        this.data.loader.more = false
      }
      var unpacked = unpackMsgContent(resp.data)
      this.setData({ messages: messages.concat(unpacked) })
    })
  },
  clickItem: function (e) {
    var idx = e.currentTarget.dataset.idx
    var msg = this.data.messages[idx]
    var key = 'messages[' + idx + '].status'
    // 跳转到帖子，并设置为已读
    wx.navigateTo({
      url: '/pages/thread/thread?pid=' + msg.post_id,
    })
    api.setMessageRead(msg.id).then( resp => {
      this.setData({
        [key]: 1,
      })
    }).catch(err => {
      console.log(err)
    })
  }
})

function unpackMsgContent(msgs) {
  var i = 0
  var n = msgs.length
  for (; i < n; i++) {
    var json = util.jsonParse(msgs[i].content)
    if (json.ok) {
      msgs[i].post_id = json.object.post_id
      msgs[i].message = json.object.message
    } else {
      msgs[i].message = msgs[i].content
    }
  }
  return msgs
}
