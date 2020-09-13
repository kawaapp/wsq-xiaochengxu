const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
const PageSize = 20

var view = undefined
function setup(_view) {
  view = _view
}

function onUnload() {
  view = undefined
}

function onLoad(opt) {
  api.getMessageList('comment', 1, PageSize).then(resp => {
    var unpacked = unpackMsgContent(resp.data)
    view.setData({ messages: unpacked, page: 1 })
  })

  setTimeout(()=> {
    setAllRead()
  }, 1000)
}

function onPullDownRefresh() {
  if (view.data.loading) {
    return
  }

  view.setData({ loading: true })
  api.getMessageList('comment', 1, PageSize).then(resp => {
    wx.stopPullDownRefresh()
    var unpacked = unpackMsgContent(resp.data)
    var unread = getUnread(resp.data)
    view.setData({ 
      loading: false, 
      page: 1,
      hasmore: resp.data && resp.data.length == 20 
    })
    view.setData({ messages: unpacked, unread: unread })
  }).catch(err => {
    wx.stopPullDownRefresh()
    view.setData({ loading: false })
    wx.showToast({
      title: '刷新失败:'+err.code, icon: 'none'
    })
    console.log(err)
  })
}

function onReachBottom() {
  if (view.data.loading || !view.data.hasmore) {
    return
  }

  var { messages, page } = view.data
  view.setData({ loading: true })

  api.getMessageList('comment', page+1, PageSize).then(resp => {
    view.setData({ 
      loading: false, 
      page: page+1,
      hasmore: resp.data.length == PageSize,
    })
    var unpacked = unpackMsgContent(resp.data)
    view.setData({ messages: messages.concat(unpacked) })
  }).catch( err => {
    view.setData({ loading: false })
    wx.showToast({
      title: '加载失败:'+err.code, icon: 'none'
    })
  })
}

function onClickItem(e) {
  var idx = e.currentTarget.dataset.idx
  var msg = view.data.messages[idx]
  // 跳转到帖子，并设置为已读
  wx.navigateTo({
    url: '/pages/thread/thread?pid=' + msg.post_id,
  })
}

function unpackMsgContent(msgs) {
  console.log(msgs)
  var i = 0
  var n = msgs.length
  for (; i < n; i++) {
    var json = util.jsonParse(msgs[i].content)
    if (json.ok) {
      msgs[i].post_id = json.object.post_id
      msgs[i].comment = json.object.comment
    } else {
      msgs[i].comment = msgs[i].content
    }
    msgs[i].time = util.formatTime(new Date(msgs[i].created_at * 1000))
  }
  return msgs
}

function getUnread(msgs) {
  var counter = 0
  msgs && msgs.map(m => {
    if (!m.status) {
      counter += 1
    }
  })
  return counter
}

function setAllRead() {
  api.setAllMessageRead('comment').then( resp => {
    // mark all as read
    var array = view.data.messages
    array.map( m => {
      m.status = 1
    })
    view.setData({messages: array})
  }).catch( err => {
    console.log(err)
  })
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
}
