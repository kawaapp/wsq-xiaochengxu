const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

const app = getApp()
const PAGE_SIZE = 20

var view = undefined
function setup(_view) {
  view = _view
}
function onUnload() {
  view = undefined
}

function refreshMessage() {
  view.setData({ refreshCounter: 0})
  
  // refresh system notification
  api.getMessageCount().then((resp) => {
    view.setData({ count: resp.data })
    console.log("get message count:", resp)
  }).catch(err => {
    console.log(err)
  })

  // refresh chat message
  api.getChatUserList(0, PAGE_SIZE).then( resp => {
    console.log("get chat user:", resp)
    wx.stopPullDownRefresh()
    view.setData({ chats: massage(resp.data)})
    view.setData({ hasmore: resp.data && resp.data.length == PAGE_SIZE })
  }).catch( err => {
    wx.stopPullDownRefresh()
    console.log(err)
  })
}

function onReachBottom() {
  if (view.data.loading || !view.data.hasmore) {
    return
  }
  var since = 0
  if (view.data.chats.length > 0) {
    since = view.data.chats[view.data.chats.length-1].id
  }
  api.getChatUserList(since, PAGE_SIZE).then(resp => {
    view.setData({
      chats: view.data.chats.concat(massage(resp.data))
    })
    view.setData({ 
      hasmore: resp.data && resp.data.length == PAGE_SIZE 
    })
  }).catch(err => {
    console.log(err)
  })
}

function massage(items) {
  var uid = app.globalData.userInfo.id
  var users = []
  items.map( item => {
    var utcTime = item.created_at * 1000
    item.date = util.msgTime(new Date(utcTime))
    if (item.from_id == uid) {
      item.other = item.to
      item.unread = false
    } else {
      item.other = item.from
      item.unread = item.status == 0
    }
    if (item.other) {
      users.push(item)
    }
  })
  return users
}

function onClickItem(e) {
  var idx = e.currentTarget.dataset.idx
  var item = view.data.chats[idx]
  var key = 'chats[' + idx + '].status'

  // set from user
  util.sendRequest('user', item.other)


  // goto chat screen
  wx.navigateTo({
    url: '/pages/chat/chat?uid=' + item.other.id,
  })

  // update item status
  view.setData({ [key]: 1})
}


module.exports = {
  setup: setup,
  onUnload: onUnload,
  refreshMessage: refreshMessage,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
}