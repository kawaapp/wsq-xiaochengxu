const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

var view = undefined
function setup(_view) {
  view = _view
}

function onUnload() {
  view = undefined
}

function onLoad(options) {
  api.getMessageList('favor').then(resp => {
    var unpacked = unpackMsgContent(resp.data)
    view.setData({ messages: unpacked })
    console.log("get favor message list:", resp.data)
  }).catch(err => {
    console.log(err)
  })
}

function onPullDownRefresh() {
  if (view.data.loader.ing) {
    return
  }

  view.setData({loader:{ing: true}})
  api.getMessageList('favor').then(resp => {
    wx.stopPullDownRefresh()
    var loader = { ing: false, more: true }
    var unpacked = unpackMsgContent(resp.data)
    if (unpacked && unpacked.length < 20) {
      loader.more = false
    }
    view.setData({ loader: loader })
    view.setData({ messages: unpacked })
  }).catch(err => {
    wx.stopPullDownRefresh()
    console.log(err)
    view.setData({ loader: { ing: false } })
    wx.showToast({
      title: '刷新失败:'+err.code, icon: 'none'
    })
  })
}

function onReachBottom() {
  if (view.data.loader.ing || !view.data.loader.more) {
    return
  }
  var messages = view.data.messages
  var since = 0
  var limit = 20
  if (messages && messages.length > 0) {
    since = messages[messages.length - 1].id
  }
  view.setData({ loader: { ing: true } })
  api.getMessageList('favor', since, limit).then(resp => {
    var loader = { ing: false, more: true }
    if (resp.data.length < limit) {
      loader.more = false
    }
    var unpacked = unpackMsgContent(resp.data)
    view.setData({ loader: loader })
    view.setData({ messages: messages.concat(unpacked) })
  }).catch( err => {
    console.log(err)
    view.setData({ loader: { ing: false } })
    wx.showToast({
      title: '加载失败:'+err.code, icon: 'none'
    })
  })
}

function onClickItem(e) {
  var idx = e.currentTarget.dataset.idx
  var msg = view.data.messages[idx]
  var key = 'messages[' + idx + '].status'
  // 跳转到帖子，并设置为已读
  view.setData({
    [key]: 1,
  })
  api.setMessageRead(msg.id).catch(err => {
    console.log(err)
  })
  // fetch post and goto thread page
  wx.navigateTo({
    url: '/pages/thread/thread?pid=' + msg.post_id,
  })
}

function unpackMsgContent(msgs) {
  var i = 0
  var n = msgs.length
  for (; i < n; i++) {
    var json = util.jsonParse(msgs[i].content)
    if (json.ok) {
      msgs[i].post_id = json.object.post_id
      msgs[i].subject = json.object.subject
    } else {
      msgs[i].subject = msgs[i].content
    }
    if (msgs[i].subject && msgs[i].subject.length > 35) {
      msgs[i].subject = msgs[i].subject.substring(0, 35) + '...'
    }
    msgs[i].time = util.formatTime(new Date(msgs[i].created_at * 1000))
  }
  return msgs
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
}