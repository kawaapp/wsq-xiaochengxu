const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const app = getApp()

var view = undefined
function setup(_view) {
  view = _view
}

function onLoad(options) {
  initData(options.uid);
}

function onUnload() {
  view = undefined
}

function initData(uid) {
  // get user
  var other = util.getRequest("user")
  if (other) {
    view.data.other = other
  }
  
  // fetch messages from user
  api.getChatMsgListFrom(uid).then(resp => {
    var items = massage(resp.data)
    view.showMessage(items)
    if (!items || items.length < 20) {
      view.setData({ loader: { more: false } })
    }
  }).catch(err => {
    console.log(err)
  })
}

// 发送消息
function onSendMessage(e) {
  if (util.isWhiteSpace(e.detail.value)) {
    wx.showToast({
      title: '发送内容不能为空', icon: 'none'
    })
    return
  }
  var from_id = app.globalData.userInfo.id
  var to_id = view.data.other.id
  var data = {
    from_id: from_id,
    to_id: to_id,
    content: e.detail.value,
  }
  console.log("send raw data:", data)
  sendMessage(data)
}

// 发送消息
function sendMessage(data) {
  api.createChatMessage(data).then( resp => {
    console.log("get resp:" + data, resp)
    var item = massage1(resp.data)
    console.log(item)
    view.appendMessage(item)
  }).catch( err => {
    console.log(err)
    wx.showToast({ title: '发送失败:'+err.code, icon: 'fail' })
  })
}

// 刷新消息
function onClickRefresh() {
  var uid = view.data.other.id
  api.getChatMsgListFrom(uid).then(resp => {
    console.log("get messages:", resp)
    var items = deltaAppend(resp.data)
    var num = items.length - view.data.chatItems.length
    view.showMessage(items)
    wx.showToast({
      title: '' + num + ' 条新消息', icon: 'none'
    })
  }).catch(err => {
    console.log(err)
  })
}

function deltaAppend(data) {
  var items = massage(data)
  var array = view.data.chatItems.slice()
  var tailId = array.length > 0 ? array[array.length - 1].id : 0
  for (var i = 0; i < items.length; i++) {
    if (items[i].id > tailId) {
      array.push(items[i])
    }
  }
  return array
}

// 下拉刷新
function onPullDown() {
  var loader = view.data.loader
  if (loader.ing || !loader.more) {
    return
  }

  var since = 0, limit = 20
  var chatItems = view.data.chatItems
  if (chatItems.length > 0) {
    since = chatItems[0].id
  }
  loader.ing = true
  view.setData({loader: loader})
  api.getChatMsgListFrom(view.data.other.id, since, limit).then( resp => {
    loader.ing = false
    var items = massage(resp.data)
    view.shiftMessage(items)
    if (!items || items.length < limit) {
      loader.more = false
    }
    view.setData({ loader: loader})
  }).catch( err => {
    loader.ing = false
    view.setData({ loader: loader })
    console.log("pull msg err,", err)
  })
}

function massage(items) {
  items.map(item => {
    massage1(item)
  })
  items.sort((a, b) => {
    return a.created_at > b.created_at
  })
  return items
}

function massage1(item) {
  var user = app.globalData.userInfo
  var other = view.data.other
  var utcTime = item.created_at * 1000
  item.time = util.prettyTime(new Date(utcTime))
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
  onUnload: onUnload,
  onClickRefresh: onClickRefresh,
  onPullDown: onPullDown,
  onSendMessage: onSendMessage, 
}