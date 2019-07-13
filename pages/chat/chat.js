// pages/list/list.js
const ctr = require('./controller.js')
const input = require("./comps/chat-input")

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
    textMessage: '',
    chatItems: [
    ],
    other: {
      uid: undefined,
    },
    latestPlayVoicePath: '',
    isAndroid: true,
    chatStatue: 'open-f',
    chatStatusContent: '加载中...',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    ctr.setup(this)
    ctr.onLoad(options)
  },

  // refresh
  showMessage(items) {
    this.setData({
      chatItems: items,
      scrollTopVal: items.length * 999,
    })
  },

  // append
  appendMessage(data) {
    this.data.chatItems.push(data)
    this.setData({
      chatItems: this.data.chatItems,
      scrollTopVal: this.data.chatItems.length * 999,
    })
  },

  // load more
  shiftMessage(items) {
    
  },

  resetInputStatus() {
    console.log("invoke reset innput..")
  },
});