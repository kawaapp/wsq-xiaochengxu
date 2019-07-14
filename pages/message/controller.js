const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

var view = undefined
function setup(_view) {
  view = _view
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
  items.map( item => {
    var utcTime = item.created_at * 1000
    item.date = util.msgTime(new Date(utcTime))
  })
  return items
}

function onClickItem(e) {
  var idx = e.currentTarget.dataset.idx
  var item = view.data.chats[idx]
  var key = 'chats[' + idx + '].status'

  // set from user
  util.sendRequest('user', item.from)

  // goto chat screen
  wx.navigateTo({
    url: '/pages/chat/chat?uid=' + item.from_id,
  })

  // update item status
  view.setData({ [key]: 1})
}


module.exports = {
  setup: setup,
  refreshMessage: refreshMessage,
  onClickItem: onClickItem,
}