// pages/list/list.js
const ctr = require('./controller.js')
const kawa = require('../../kawa.js')
/**
 * 聊天页面
 */
Page({
  //{
  //  showTime: "2015年",
	//  time: "2015-07-09",
  //  headUrl: "",
  //  isMy: true,
  //  content: "Hello",
	//  type: 'text',
  //},
  /**
   * 页面的初始数据
   */
  data: {
    theme: {
      images: kawa.Theme.Image,
    },
    textMessage: '',
    chatItems: [
    ],
    other: {
      uid: undefined,
    },
    reply: {
      enable: false,
    },
    loader: {
      ing: false,
      more: true,
    },
    scrollTopVal: 10000,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    ctr.setup(this)
    ctr.onLoad(options)
  },
  onUnload() {
    ctr.onUnload()
  },

  /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
  onPullDown: function () {
    ctr.onPullDown()
  },

  // 点击刷新
  clickRefresh: function (e) {
    ctr.onClickRefresh(e)
  },

  // refresh
  showMessage(items) {
    showTime(items)
    this.setData({
      chatItems: items,
      scrollTopVal: items.length * 999,
    })
  },

  // append
  appendMessage(data) {
    var prev = undefined
    if (this.data.chatItems) {
      prev = this.data.chatItems.slice(-1)
    }
    showTime([data], prev)
    this.data.chatItems.push(data)
    this.setData({
      chatItems: this.data.chatItems,
      scrollTopVal: this.data.chatItems.length * 999,
    })
  },

  // load more
  shiftMessage(items) {
    if (items && items.length > 0) {
      showTime(items)
      var data = items.concat(this.data.chatItems)
      this.setData({
        chatItems: data,
        scrollTopVal: data.length * 999,
      })
    }
  },

  // send message
  sendComment: function(e) {
    ctr.onSendMessage(e)
  },

  resetInputStatus() {
    console.log("invoke reset innput..")
  },
});

function showTime(items, prev) {
  if (!prev) {
    prev = { created_at: 1<<32 }
  }
  var n = items ? items.length : 0
  for (var i = 0; i < n; i++) {
    if ((items[i].created_at - prev.created_at) >= _5M) {
      items[i].showTime = true
    }
    prev = items[i]
  }
}
const _5M = 5 * 60; // 5 分钟