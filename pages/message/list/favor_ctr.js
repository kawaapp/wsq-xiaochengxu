const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

var view = undefined
function setup(_view) {
  view = _view
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
  api.getMessageList('favor').then(resp => {
    var unpacked = unpackMsgContent(resp.data)
    view.setData({ messages: unpacked })
  }).catch(err => {
    console.log(err)
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
  api.getMessageList('favor', since, limit).then(resp => {
    if (resp.data.length < limit) {
      view.data.loader.more = false
    }
    var unpacked = unpackMsgContent(resp.data)
    view.setData({ messages: messages.concat(unpacked) })
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
    msgs[i].time = util.formatTime(new Date(msgs[i].created_at * 1000))
  }
  return msgs
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
}