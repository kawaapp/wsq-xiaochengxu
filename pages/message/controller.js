const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

const app = getApp()

var view = undefined
function setup(_view) {
  view = _view
}
function onUnload() {
  view = undefined
}

function refreshMessage() {
  // refresh system notification
  api.getMessageCount().then((resp) => {
    view.setData({ count: resp.data })
    console.log("get message count:", resp)
  }).catch(err => {
    console.log(err)
  })

  // refresh chat message
  api.getChatUserList().then( resp => {
    console.log("get chat user:", resp)
    view.setData({ chats: massage(resp.data)})
  }).catch( err => {
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
  onClickItem: onClickItem,
}