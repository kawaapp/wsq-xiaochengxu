const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
const PageSize  =20

var view = undefined
function setup(_view) {
  view = _view
}

function onUnload() {
  view = undefined
}

function onLoad(options) {
  api.getMessageList('favor', 1, PageSize).then(resp => {
    var unpacked = unpackMsgContent(resp.data)
    view.setData({ messages: unpacked, page: 1 })
  }).catch(err => {
    console.log(err)
  })

  setTimeout(()=> {
    setAllRead()
  }, 1000)
}

function onPullDownRefresh() {
  if (view.data.loading) {
    return
  }

  view.setData({loading: true })
  api.getMessageList('favor', 1, PageSize).then(resp => {
    wx.stopPullDownRefresh()
    var unpacked = unpackMsgContent(resp.data)
    view.setData({ 
      loading: false, 
      page: 1,
      hasmore: resp.data && resp.data.length == PageSize
    })
    view.setData({ messages: unpacked })
  }).catch(err => {
    wx.stopPullDownRefresh()
    console.log(err)
    view.setData({ loading: false })
    wx.showToast({
      title: '刷新失败:'+err.code, icon: 'none'
    })
  })
}

function onReachBottom() {
  if (view.data.loading || !view.data.hasmore) {
    return
  }
  var { messages, page } = view.data
  view.setData({ loading: true })

  api.getMessageList('favor', page+1, PageSize).then(resp => {
    var unpacked = unpackMsgContent(resp.data)
    view.setData({ 
      loading: false, 
      page: page+1,
      hasmore: resp.data.length == PageSize 
    })
    view.setData({ messages: messages.concat(unpacked) })
  }).catch( err => {
    console.log(err)
    view.setData({ loading: false })
    wx.showToast({
      title: '加载失败:'+err.code, icon: 'none'
    })
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


function setAllRead() {
  api.setAllMessageRead('favor').then(resp => {
    // mark all as read
    var array = view.data.messages
    array.map(m => {
      m.status = 1
    })
    view.setData({ messages: array })
  }).catch(err => {
    console.log(err)
  })
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
}