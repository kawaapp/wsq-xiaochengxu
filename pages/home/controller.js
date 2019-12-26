const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const biz = require('../../utils/biz.js')
const app = getApp()

const ratio = app.globalData.ratio
const resize = {
  logo: `?x-oss-process=image/resize,w_${144 * ratio}`,
  cover: `?x-oss-process=image/resize,w_${750 * ratio}`,
}

var view = undefined

// Home Controller 
function setup(_view) {
  view = _view
}

function onUnload() {
  view = undefined
}

// First Load
function onLoad(opt) {
  // 基本信息
  render(app)

  // 加载置顶列表
  fetchTopList()
}

function render(app) {
  // meta
  app.onChange("meta", (meta) => {
    // resize logo and cover
    if (meta.app_logo && !meta.app_logo.includes("x-oss")) {
      meta.app_logo += resize.logo
    }
    if (meta.app_cover && !meta.app_cover.includes("x-oss")) {
      meta.app_cover += resize.cover
    }
    view && view.setData({ meta: meta })

    // 公告
    var pub = {
      title: meta.app_pubtitle,
      link: meta.app_publink,
    }
    view && view.setData({ speaker: pub })

    // PageTitle
    wx.setNavigationBarTitle({
      title: meta.app_name || '',
    })

    // 检查
    checkAdminPostOnly()
  })

  // 话题
  app.onChange("tags", (tags) => {
    view && view.setData({ tags: tags })
  })

  // 签到
  app.onChange("signed", (signed) => {
    view && view.setData({ signed: signed || false })
  })

  // 未读消息
  app.onChange("messages", (m) => {
    if (m.notification) {
      wx.setTabBarBadge({ index: 1, text: '' + m.notification })
    } else if (m.chat) {
      wx.showTabBarRedDot({ index: 1 })
    }
    app.globalData.messages = {}
  })

  // 当前用户
  app.onChange("userInfo", () => {
    checkAdminPostOnly()
  })
}

function checkAdminPostOnly() {
  const { meta, userInfo } = app.globalData
  if (meta && meta.app_admin_only && userInfo && !userInfo.admin ) {
    view && view.setData({ hideNewButton: true})
  }
}

function fetchTopList() {
  api.getPostList(0, 1000, "top").then(resp => {
    const items = resp.data
    if (items) {
      items.map(item => {
        item.title = getTitle(item)
      })
      view.setData({
        tops: items,
      })
    }
  })
}

function getSelectedTopic() {
  var topic = view.data.topic
  if (topic.selected > 0 && topic.selected < topic.items.length) {
    return topic.items[topic.selected].text
  }
}

function getTitle(item) {
  if (item.title) {
    return item.title
  }
  if (!item || !item.content) {
    return ""
  }
  var array = item.content.split("\n")
  if (array.length > 0) {
    return array[0]
  }
  return ""
}

function onClickNewPost(e) {
  if (!biz.isUserHasName(view)) {
    return
  }
  wx.navigateTo({
    url: '/pages/writer/writer',
  })
}

function onClickShare(res) {
  var meta = app.globalData.meta
  return {
    title: meta.app_name,
    path: '/pages/login/login?q=home',
    imageUrl: meta.app_shareimg,
  }
}

function onClickSignin(e) {
  if (!biz.isUserHasName(view)) {
    return
  }
  if (view.data.signed) {
    wx.navigateTo({
      url: '/pages/signin/signin',
    })
    return
  }

  // 执行签到
  api.signin().then(resp => {
    view.setData({ signed: true })
    if (resp.data.code == 4001) {
      wx.showToast({
        title: '已签到', icon: "success"
      })
    } else {
      wx.showToast({
        title: '签到成功', icon: "success"
      })
    }
  }).catch(err => {
    console.log(err)
    wx.showToast({ title: '签到失败:'+err.code, icon: "none" })
  }) 
}

function onResult(data) {
  if (data && data.ok && view.data.tab.current == 0) {
    view.onPullDownRefresh()
  }
}

function onClickSpeaker() {
  var url = view.data.speaker.link
  if (url) {
    wx.navigateTo({
      url: '/pages/webview/webview?q=' + encodeURI(url),
    })
  }
}

function onClickTopList(e) {
  var idx = e.currentTarget.dataset.idx
  var post = view.data.tops[idx]
  util.sendRequest('post', {
    idx: idx,
    post: post,
    viewonly: true,
  })
  wx.navigateTo({
    url: '/pages/thread/thread',
  })
}

function onPullDownRefresh() {
  fetchTopList()
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onResult: onResult,
  onClickNewPost: onClickNewPost,
  onClickShare: onClickShare,
  onClickSpeaker: onClickSpeaker,
  onClickTopList: onClickTopList,
  onClickSignin: onClickSignin,
  onPullDownRefresh: onPullDownRefresh, 
}