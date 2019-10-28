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
  var meta = app.globalData.meta
  // resize logo and cover
  meta.app_logo += resize.logo
  meta.app_cover += resize.cover

  view.setData({ meta: meta })

  // 公告
  var pub = {
    title: meta.app_pubtitle,
    link: meta.app_publink,
  }
  view.setData({ speaker: pub })

  // PageTitle
  wx.setNavigationBarTitle({
    title: meta.app_name || '',
  })

  // 签到
  var signed = app.globalData.signed
  view.setData({ signed: signed || false })

  // 加载置顶列表
  fetchTopList()
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
      console.log("get top-list:", items)
    }
  })
}

// show topic
function showTopic(items) {
  if (!items || items.length == 0) {
    return
  }
  var topics = items.slice(0)
  topics.unshift({text: "全部话题"})
  view.setData({ topic: { items: topics, selected: -1}})
}

function getSelectedTopic() {
  var topic = view.data.topic
  if (topic.selected > 0 && topic.selected < topic.items.length) {
    return topic.items[topic.selected].text
  }
}

function getTitle(item) {
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
  if (!biz.isUserHasName()) {
    return
  }
  wx.navigateTo({
    url: '/pages/writer/writer',
  })
}

// 切换 TAB
function onTabChanged(idx) {
  console.log("on tab changed:", idx)
  refreshList(idx)
}

function listLoadMore(tabIndex, topic) {

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
  if (!biz.isUserHasName()) {
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
  // if (data && data.ok && view.data.tab.current == 0) {
  //   refreshList(0, getSelectedTopic())
  // }
  console.log('home, on result data:' + data)
}

function onPullDownRefresh() {

}

function onReachBottom() {

}



module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onTabChanged: onTabChanged,
  onResult: onResult,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickNewPost: onClickNewPost,
  onClickShare: onClickShare,
}