const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const input = require("./comps/chat-input")

const app = getApp()

var view = undefined
function setup(_view) {
  view = _view
}

function onLoad(options) {
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
    sendMessage(data)
  });

  var other = util.getRequest("user")
  if (other) {
    view.data.other = other
  } 
  
  // fetch messages from user
  api.getChatMsgListFrom(uid).then( resp => {
    console.log("get messages:", resp)
    var items = massage(resp.data)
    view.showMessage(items)
  }).catch(err => {
    console.log(err)
  })

  // mark read
  api.setChatMessageRead(view.data.other.id).then(resp => {
    console.log("mark success")
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
  console.log("click refresh...")
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
}