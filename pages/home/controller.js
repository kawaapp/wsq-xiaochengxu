const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const biz = require('../../utils/biz.js')
const app = getApp()

var view = undefined

// Home Controller 
function setup(_view) {
  view = _view
  var tabData = _view.data.tabData

  var i = 0, n = view.data.tab.items.length
  for (; i < n; i++) {
    tabData.push({ loader: {
      ing: false,
      more: true,
    }, posts: []})
  }
}

function getTabData() {
  var tabData = view.data.tabData
  return tabData[view.data.tab.current]
}

function showTabData() {
  view.setData({ tabData: view.data.tabData})
}

function onUnload() {
  view = undefined
}

// First Load
function onLoad(opt) {
  // 加载社区信息
  biz.getMetaData(data => {
    view.setData({
      meta: data
    })
    app.globalData.meta = data

    // 公告
    var pub = {
      title: data.app_pubtitle,
      link: data.app_publink,
    }
    view.setData({ speaker: pub })

    // PageTitle
    wx.setNavigationBarTitle({
      title: data.app_name,
    })
  })

  // 加载置顶列表
  api.getPostList(0, 1000, "top").then(resp => {
    const items = resp.data
    if (items) {
      items.map( item => {
        item.title = getTitle(item)
      })
      view.setData({
        tops: items,
      })
      console.log("get top-list:", items)
    }
  })

  // 进入第一次加载
  refreshList(view.data.tab.current)

  // 用户信息
  try {
    const value = wx.getStorageSync('user')
    if (value) {
      app.globalData.userInfo = value
    }
  } catch (e) {
    // Do something when catch error
  }
  api.getSelf().then((resp) => {
    app.globalData.userInfo = resp.data
    // refresh local storage
    wx.setStorage({ key: 'user', data: resp.data })
  })

  // 话题列表
  try {
    wx.getStorage({ key: 'topic', success: function(res) {
        showTopic(res.data)
    }})
  } catch(e){}

  api.getTagList().then( resp => {
    app.globalData.topics = resp.data
    showTopic(resp.data)
    // refresh local storage
    wx.setStorage({ key: 'topic', data: resp.data })
  })

  // 签到状态
  api.getSignToday().then(resp => {
    view.setData({ signed: resp.data.ok })
  }).catch(err => {
    console.log(err)
  })

  // 等级列表
  // TODO 或者放在 我的 界面更新.
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

function refreshList(tabIndex, topic) {
  var tabData = view.data.tabData
  var data = tabData[tabIndex]
  if (data.loader.ing) {
    return
  }
  var fitler = ""
  if (tabIndex == 1) {
    fitler = "val"
  }
  var limit = 20
  data.loader.ing = true
  data.loader.more = true
  data.posts = []
  showTabData()

  console.log("load data for tab:" + tabIndex, "filter:" + fitler)
  api.getPostList(0, limit, fitler, topic).then(resp => {
    data.loader.ing = false
    if (resp.data) {
      if (resp.data.length < limit) {
        data.loader.more = false
      }
      data.posts = decoratePosts(resp.data)
    }
    showTabData()
    wx.stopPullDownRefresh()
  }).catch(err => {
    data.loader.ing = false
    showTabData()
    wx.stopPullDownRefresh()
    wx.showToast({
      title: '加载失败:' + err.code, icon: 'none'
    })
    console.log("refresh list:", err)
  })
}

function onResult(data) {
  if (data && data.ok && view.data.tab.current == 0) {
    refreshList(0, getSelectedTopic())
  }
  console.log('home, on result data:' + data)
}

// 下拉事件是全局的，如果页面正在刷新，无论哪个页面都应该
// 直接停掉下拉刷新
function onPullDownRefresh() {
  var data = getTabData()
  if (data.loader.ing) {
    wx.stopPullDownRefresh()
    return
  }
  var tabIndex = view.data.tab.current
  if (tabIndex == 0) {
    refreshList(tabIndex, getSelectedTopic())
  } else {
    refreshList(tabIndex)
  }
}

function onReachBottom() {
  var data = getTabData()
  if (data.loader.ing || !data.loader.more) {
    return
  }
  var tabData = view.data.tabData
  var tabIndex = view.data.tab.current
  var filter = ""
  if (tabIndex == 1) {
    filter = "val"
  }
  var topic = undefined
  if (tabIndex == 0) {
    topic = getSelectedTopic()
  }
  var data = tabData[tabIndex]
  var posts = data.posts
  var sinceId = 0, limit = 20
  if (posts && posts.length > 0) {
    sinceId = posts[posts.length - 1].id
  }
  data.loader.ing = true
  showTabData()

  api.getPostList(sinceId, limit, filter, topic).then((resp) => {
    data.loader.ing = false
    if (resp.data) {
      if (resp.data.length < 20) {
        data.loader.more = false
      }
      var styled = decoratePosts(resp.data)
      data.posts = posts.concat(styled)
    }
    showTabData()
  }).catch((err) => {
    data.loader.ing = false
    showTabData()
    wx.showToast({
      title: '加载失败:'+err.code, icon: 'none'
    })
  })
}

function listLoadMore(tabIndex, topic) {

}

function onClickFavor(e) {
  var idx = e.currentTarget.dataset.idx
  var item = getTabData().posts[idx]
  var index = view.data.tab.current
  var key = 'tabData['+ index + '].posts[' + idx + '].stats'

  if (!item.stats) {
    item.stats = { favored: false, favors: 0, comments: 0 }
  }

  if (item.stats.favored && item.stats.favored > 0) {
    console.log("delete favor")
    api.deletePostFavor(item.id).then(resp => {
      item.stats.favored = false,
        item.stats.favors -= 1
      view.setData({ [key]: item.stats })
      console.log("delete favor:", resp.statusCode)
    })
  } else {
    console.log("create favor")
    api.createPostFavor(item.id).then((resp) => {
      item.stats.favors += 1
      item.stats.favored = true
      view.setData({ [key]: item.stats })
      console.log("favor succ:", resp.statusCode)
    }).catch(err => {
      console.log("favor err:", err)
    })
  }
}

function onClickMenu(e) {
  var data = getTabData()
  var idx = e.currentTarget.dataset.idx
  var item = data.posts[idx]
  var menu = {
    items: ["举报"],
    actions: [function () {
      report(item)
    }],
  }
  var user = app.globalData.userInfo
  if (user && item.author && user.id == item.author.id) {
    menu.items.push("删除")
    menu.actions.push(function () {
      deletePost(idx)
    })
  }

  wx.showActionSheet({
    itemList: menu.items,
    success: function (res) {
      console.log(JSON.stringify(res))
      console.log(res.tapIndex) // 用户点击的按钮，从上到下的顺序，从0开始
      var fn = menu.actions[res.tapIndex]
      fn()
    },
    fail: function (res) {
      console.log(res.errMsg)
    }
  })
}

function report(post) {
  var digest = {
    text: post.content,
    images: post.images,
  }
  var data = {
    entity_id: post.id,
    entity_ty: 0,
    content: JSON.stringify(digest)
  }

  api.createReport(data).then( resp => {
    wx.showToast({
      title: '举报成功',
    })
  }).catch( err => {
    wx.showToast({
      title: '举报失败：网络错误', icon: 'none',
    })
  })
}

function decoratePosts(posts) {
  var result = []
  var author = app.globalData.userInfo

  for (var i = 0; i < posts.length; i++) {
    var post = posts[i]
    var hide = (post.status >> 2) & 1

    // 如是本人的帖子则不隐藏
    if (post.author && author && post.author.id == author.id) {
      hide = false
    }

    // 如果是需要审核的帖子，即使本人也不显示直到已审核
    // 因为微信审核人员会傻缺的以为你没有审核系统...
    if ((post.status >> 3) & 1) {
      hide = true
    }

    if (!hide) {
      result.push(decoratePost(post))
    }
  }
  return result
}

function decoratePost(post) {
  var utcTime = post.created_at * 1000
  post.time = util.formatTime(new Date(utcTime))
  post.agoTime = util.agoTime(utcTime)
  if (post.media) {
    if (post.media.type == 1) {
      post.images = JSON.parse(post.media.path)
    } else if (post.media.type == 3) {
      post.video = JSON.parse(post.media.path)
    }
  }
  if (post.location) {
    try {
      post.location = JSON.parse(post.location)
    } catch(err){}
  }
  return post
}

function deletePost(idx) {
  var posts = getTabData().posts
  var post = posts[idx]
  api.deletePost(post.id).then(resp => {
    posts.splice(idx, 1)
    showTabData()
    wx.showToast({
      title: '删除成功',
    })
    console.log("删除成功")
  }).catch(err => {
    console.log("删除失败")
    wx.showToast({
      title: '删除失败:'+err.code, icon: 'none'
    })
  })
}


function onClickImageList(e) {
  var index = e.currentTarget.dataset.idx
  var index2 = e.target.dataset.idx
  console.log("get index:" + index + " index2:" + index2)
}

function onClickTopic(e) {
  // 高亮选项
  var idx = e.target.dataset.idx;
  var topic = view.data.topic
  topic.selected = idx
  view.setData({ topic: topic })

  // 刷新列表
  refreshList(0, getSelectedTopic())
}

function onClickShare(res) {
  var meta = app.globalData.meta
  return {
    title: meta.app_name,
    path: '/pages/login/login?q=home',
    imageUrl: meta.app_shareimg,
  }
}

function onClickLocation(e) {
  var idx = e.currentTarget.dataset.idx
  var item = getTabData().posts[idx]
  var location = item.location
  if (location) {
    wx.openLocation({
      latitude: location.lat, longitude: location.lng, name: location.name,
    })
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

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onTabChanged: onTabChanged,
  onResult: onResult,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickFavor: onClickFavor,
  onClickMenu: onClickMenu,
  onClickNewPost: onClickNewPost,
  onClickTopic: onClickTopic,
  onClickShare: onClickShare,
  onClickLocation: onClickLocation,
  onClickSignin: onClickSignin,
}