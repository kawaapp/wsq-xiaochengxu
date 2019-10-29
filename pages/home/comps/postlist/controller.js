const api = require('../../../../utils/api.js')
const util = require('../../../../utils/util.js')
const biz = require('../../../../utils/biz.js')

const app = getApp()
const PAGE_SIZE = 20

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
  // fetch post
  var filter = view.data.filter
  fetchPostList(filter, "")
}

// 下拉刷新
function onPullDownRefresh() {
  if (view.data.loader.ing) {
    return
  }
  var filter = view.data.filter
  fetchPostList(filter, "")
}

function fetchPostList(filter, topic) {
  if (view.data.loader.ing) {
    return
  }

  view.setData({loader: { ing: true, more: true} })
  view.setData({posts: [] })

  api.getPostList(0, PAGE_SIZE, filter, topic).then(resp => {
    wx.stopPullDownRefresh()
    console.log("get post list:", resp)
    var loader = {
      ing: false,
      more: resp.data && resp.data.length === PAGE_SIZE
    }
    view.setData({ loader })
    view.setData({ posts: massage(resp.data)})
  }).catch(err => {
    wx.stopPullDownRefresh()
    var loader = {
      ing: false,
      more: view.data.loader.more
    }
    view.setData({ loader })
    wx.showToast({
      title: '加载失败:' + err.code, icon: 'none'
    })
    console.log("refresh list:", err)
  })
}

function onReachBottom() {
  var loader = view.data.loader
  if (loader.ing || !loader.more) {
    return
  }

  var filter = view.data.filter
  var topic = ""
  var posts = view.data.posts

  var sinceId = 0, limit = PAGE_SIZE
  if (posts && posts.length > 0) {
    sinceId = posts[posts.length - 1].id
  }

  view.setData({loader: { 
      ing: true,
      more: loader.more,
  }})

  api.getPostList(sinceId, limit, filter, topic).then((resp) => {
    var loader = {
      ing: false,
      more: resp.data && resp.data.length === limit
    }
    view.setData({ loader: loader })
    var styled = massage(resp.data)
    view.setData({ posts: posts.concat(styled)})
  }).catch((err) => {
    console.log(err)
    view.setData({
      ing: false,
      more: loader.more
    })
    wx.showToast({
      title: '加载失败:' + err.code, icon: 'none'
    })
  })
}

function onClickItem(e) {
  var idx = e.currentTarget.dataset.idx
  var post = view.data.posts[idx]
  util.sendRequest('post', {
    idx: idx,
    post: post
  })
  wx.navigateTo({
    url: '/pages/thread/thread',
  })
}

function onClickAvatar(e) {
  var idx = e.currentTarget.dataset.idx
  var post = view.data.posts[idx]
  if (post.author) {
    util.sendRequest('user', {
      idx: idx,
      data: post.author
    })
    wx.navigateTo({
      url: '/pages/user/user/user',
    })
  } else {
    wx.showToast({
      title: '用户不存在', icon: 'none'
    })
  }
}

function onClickFavor(e) {
  var idx = e.currentTarget.dataset.idx
  var item = view.data.posts[idx]
  var key = 'posts[' + idx + '].stats'

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

function onClickComment(e) {
  var idx = e.currentTarget.dataset.idx
  var post = view.data.posts[idx]
  util.sendRequest('post', {
    idx: idx,
    post: post
  })
  wx.navigateTo({
    url: '/pages/thread/thread',
  })
}

function onClickMenu(e) {
  var idx = e.currentTarget.dataset.idx
  var item = view.data.posts[idx]
  var menu = {
    items: ["举报"],
    actions: [function () {
      report(item)
    }],
  }

  if (item.stats && item.stats.favorite) {
    menu.items.push("取消收藏")
    menu.actions.push(function () {
      onClickFavorite(idx)
    })
  } else {
    menu.items.push("收藏")
    menu.actions.push(function () {
      onClickFavorite(idx)
    })
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

  api.createReport(data).then(resp => {
    wx.showToast({
      title: '举报成功',
    })
  }).catch(err => {
    wx.showToast({
      title: '举报失败：网络错误', icon: 'none',
    })
  })
}

function massage(posts) {
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
      result.push(decorate(post))
    }
  }
  return result
}

function decorate(post) {
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
    } catch (err) { }
  }
  return post
}

function deletePost(idx) {
  var posts = view.data.posts
  var post = posts[idx]
  api.deletePost(post.id).then(resp => {
    posts.splice(idx, 1)
    view.setData({posts: posts})
    wx.showToast({
      title: '删除成功',
    })
    console.log("删除成功")
  }).catch(err => {
    console.log("删除失败")
    wx.showToast({
      title: '删除失败:' + err.code, icon: 'none'
    })
  })
}

function onClickFavorite(idx) {
  var item = view.data.posts[idx]
  if (item.stats.favorite) {
    console.log("delete favorite")
    api.deleteFavorite(item.id).then(resp => {
      item.stats.favorite = false
      wx.showToast({
        title: '取消成功', icon: 'none'
      })
    }).catch(err => {
      wx.showToast({
        title: '取消失败', icon: 'none'
      })
      console.log(err)
    })
  } else {
    api.createFavorite(item.id).then((resp) => {
      item.stats.favorite = true
      wx.showToast({
        title: '收藏成功', icon: 'none'
      })
      console.log("favorite succ:", resp.statusCode)
    }).catch(err => {
      wx.showToast({
        title: '收藏失败', icon: 'none'
      })
      console.log("favor err:", err)
    })
  }
}

function onClickTopic(e) {
  // 高亮选项
  var idx = e.target.dataset.idx;
  view.setData({ tagSelected: idx })

  var tag = ""
  if (idx > 0) {
    tag = view.data.tagArray[idx].text
  }
  // 刷新列表
  fetchPostList(view.data.filter, tag)
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
  onClickAvatar: onClickAvatar,
  onClickFavor: onClickFavor,
  onClickComment: onClickComment,
  onClickMenu: onClickMenu,
  onClickTopic: onClickTopic,
}