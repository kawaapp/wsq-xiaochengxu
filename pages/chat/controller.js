const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const input = require("./comps/chat-input")

const app = getApp()

var view = undefined
function setup(_view) {
  view = _view
}

function onLoad(options) {
  console.log("option:", options)
  initData(options.uid);
}

function initData(uid) {
  let that = view;
  let systemInfo = wx.getSystemInfoSync();
  input.init(view, {
    systemInfo: systemInfo,
    sendButtonBgColor: 'mediumseagreen',
    sendButtonTextColor: 'white',
  });

  that.setData({
    pageHeight: systemInfo.windowHeight,
    isAndroid: systemInfo.system.indexOf("Android") !== -1,
  });

  // setup input event
  input.setTextMessageListener((e) => {
    console.log("get input event:" + e.detail.value)
    
    var from_id = app.globalData.userInfo.id
    var to_id = view.data.other.id
    var data = {
      from_id: from_id,
      to_id: to_id,
      content: e.detail.value,
    }
    console.log("send raw data:", data)
    sendMessage(data)
  });

  var other = util.getRequest("user")
  if (other) {
    view.data.other = other
  } 

  // fetch messages from user
  refresh(uid)

  // mark read
  api.setChatMessageRead(uid).then(resp => {
    console.log("mark success")
  }).catch(err => {
    console.log(err)
  })
}

function refresh(uid, tip) {
  api.getChatMsgListFrom(uid).then(resp => {
    console.log("get messages:", resp)
    var items = massage(resp.data)
    view.showMessage(items)
    if (!items || items.length < 20) {
      view.setData({ loader: { more: false } })
    }
    if (tip) {
      wx.showToast({
        title: '加载成功', icon: 'none'
      })
    }
  }).catch(err => {
    console.log(err)
  })
}

// 发送消息
function sendMessage(data) {
  api.createChatMessage(data).then( resp => {
    console.log("get resp:" + data, resp)
    var items = massage1(resp.data)
    console.log(items)
    view.appendMessage(items)
  }).catch( err => {
    console.log(err)
    wx.showToast({ title: '发送失败..', icon: 'fail' })
  })
}

// 刷新消息
function onClickRefresh() {
  refresh(view.data.other.id, true)
}

function massage(items) {
  items.map( item => {
    massage1(item)
  })
  items.sort((a, b ) => {
    return a.created_at > b.created_at
  })
  return items
}

function onPullDown() {
  var loader = view.data.loader
  if (!loader.more) {
    wx.stopPullDownRefresh()
    return
  }

  var since = 0, limit = 20
  var chatItems = view.data.chatItems
  if (chatItems.length > 0) {
    since = chatItems[0].id
  }
  api.getChatMsgListFrom(view.data.other.id, since, limit).then( resp => {
    wx.stopPullDownRefresh()
    var items = massage(resp.data)
    view.shiftMessage(items)
    if (!items || items.length < limit) {
      view.setData({loader: {more: false}})
    }
  }).catch( err => {
    wx.stopPullDownRefresh()
    console.log("pull msg err,", err)
  })
}

function massage1(item) {
  var user = app.globalData.userInfo
  var other = view.data.other
  var utcTime = item.created_at * 1000
  item.time = util.formatTime(new Date(utcTime))
  item.showTime = false
  item.isMy = item.from_id == user.id
  if (item.isMy) {
    item.headUrl = user.avatar
  } else {
    item.headUrl = other.avatar
  }
  item.type = 'text' 
  return item
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onClickRefresh: onClickRefresh,
  onPullDown: onPullDown,
}