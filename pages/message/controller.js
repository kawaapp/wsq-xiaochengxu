const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const biz = require('../../utils/biz.js')

const app = getApp()
const PAGE_SIZE = 20

var view = undefined
function setup(_view) {
  view = _view
}
function onUnload() {
  view = undefined
}

function onLoad() {
  // 评论/点赞/私信 只要耗尽都重新提示
  var templates = app.globalData.templates
  if (templates.length > 0) {
    api.getUserSubList().then( resp => {
      var map = {}
      resp.data.map( sub => {
        map[sub.template] = sub.ava_counter
      })
      var hasRunout = false
      templates.filter( t => {
        return (t.usage >= 1 && t.usage <= 3)
      }).map( t => {
        if (map[t.template] != undefined && map[t.template] <= 0) {
          hasRunout = true
        }
      })
      view.setData({ showSub: hasRunout })
    }).catch( err => {
      console.log(err)
    })
  }
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

// 注意：
// 这个方法必须配置模板列表
function onClickSubscribe(e) {
  biz.subscribe("", (ok, err) => {
    if (ok) {
      view.setData({ showSub: false })
      wx.showToast({ title: '订阅成功！' })
    }

    if (!ok || (err && err.errCode == 20004)) {
      wx.showModal({
        title: "温馨提示",
        content: "您有订阅消息被取消，点击“去设置”开启订阅通知",
        confirmText: "去设置",
        success: function() {
          wx.openSetting({withSubscriptions: true})
        }
      })
    }
  })
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  refreshMessage: refreshMessage,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
  onClickSubscribe: onClickSubscribe,
}