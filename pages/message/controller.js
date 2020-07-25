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

// 评论/点赞/私信 只要耗尽都重新提示
function onLoad() {
  var templates = app.globalData.templates || []
  if (templates.length > 0) {
    api.getSubState().then( resp => {
      if (resp.data.require) {
        view.setData({ showSub: true })
      }
    }).catch( err => {
      console.log(err)
    })
  }
}

function refreshMessage() {
  // refresh system notification
  api.getMessageCount().then((resp) => {
    view.setData({ count: resp.data })
    onCountChanged( resp.data )
  }).catch(err => {
    console.log(err)
  })

  // refresh chat message
  api.getChatUserList(1, PAGE_SIZE).then( resp => {
    wx.stopPullDownRefresh()
    onChatChanged(resp.data)
    view.setData({ chats: massage(resp.data)})
    view.setData({ 
      page: 1, hasmore: resp.data && resp.data.length == PAGE_SIZE 
    })
  }).catch( err => {
    wx.stopPullDownRefresh()
    console.log(err)
  })
}

// 通知变化刷新红点
function onCountChanged(data) {
  var count = data.favors + data.comments
  if (count) {
    wx.setTabBarBadge({ index: 1, text: '' + count })
  } else {
    wx.removeTabBarBadge({index: 1})
  }
}

// 聊天列表变化刷新红点, 如果已经显示则不再刷新
function onChatChanged(items) {
  var count = view.data.count
  if ((count.favors + count.comments) > 0) {
    return
  }

  var uid = app.globalData.userInfo.id
  var check = false
  items.map(item => {
    if (item.from_id != uid && item.status === 0) {
      check = true
    }
  })
  if (check) {
    wx.showTabBarRedDot({ index: 1 })
  } else {
    wx.hideTabBarRedDot({index: 1})
  }
}

function onReachBottom() {
  if (view.data.loading || !view.data.hasmore) {
    return
  }
  var { chats, page } = view.data
  view.setData({ loading: true })
  
  api.getChatUserList(page+1, PAGE_SIZE).then(resp => {
    view.setData({ 
      chats: chats.concat(massage(resp.data)),
      page: page+1, 
      hasmore: resp.data && resp.data.length == PAGE_SIZE ,
      loading: false,
    })
  }).catch(err => {
    view.setData({
      loading: false,
    })
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
        success: function(res) {
          if (res.confirm) {
            wx.openSetting({withSubscriptions: true})
          }
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