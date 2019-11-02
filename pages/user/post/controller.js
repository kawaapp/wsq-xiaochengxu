const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
const biz = require('../../../utils/biz.js')

var view = undefined
function setup(v) {
  view = v
}
function onUnload() {
  view = undefined
}

function onLoad(options) {
  if (options && options.uid) {
    view.data.user.uid = options.uid
  }

  // show loading
  var loader = view.data.loader
  loader.ing = true
  view.setData({loader: loader})

  // fetch data 
  api.getUserPostList(view.data.user.uid).then(resp => {
    loader.ing = false
    if (resp.data && resp.data.length < 20) {
      loader.more = false
    }
    console.log("user get posts:", resp)
    var posts = massage(resp.data)
    view.setData({ posts: resp.data })
    view.setData({ loader: loader })
  }).catch( err => {
    console.log(err)
    wx.showToast({
      title: '加载失败:'+err.code, icon: 'none'
    })
    loader.ing = false
    view.setData({loader: loader})
  })
}

function onPullDownRefresh() {
  if (view.data.loader.ing) {
    return
  }

  // show loading
  var loader = view.data.loader
  loader.ing = true
  view.setData({ loader: loader })

  // fetch data
  api.getUserPostList(view.data.user.uid).then(resp => {
    loader.ing = false
    if (resp.data && resp.data.length < 20) {
      loader.more = false
    }
    var data = massage(resp.data)
    view.setData({ posts: data })
    view.setData({ loader: loader })
    wx.stopPullDownRefresh()
    wx.showToast({
      title: '刷新成功',
      icon: 'success',
    })
  }).catch( err => {
    wx.stopPullDownRefresh()
    wx.showToast({ title: '刷新失败:'+err.code, icon: 'none'})
    loader.ing = false
    view.setData({ loader: loader })
  })
}

function onReachBottom() {
  if (view.data.loader.ing || !view.data.loader.more) {
    return
  }
  var posts = view.data.posts
  var since = 0
  var limit = 20
  if (posts && posts.length > 0) {
    since = posts[posts.length - 1].id
  }
  var loader = view.data.loader
  loader.ing = true
  view.setData({loader: loader})
  api.getUserPostList(view.data.user.uid, since, limit).then(resp => {
    loader.ing = false
    if (resp.data.length < limit) {
      loader.more = false
    }
    var data = massage(resp.data)
    view.setData({ loader: loader })
    view.setData({ posts: posts.concat(data) })
  }).catch( err=> {
    loader.ing = false
    view.setData({ loader: loader })
    wx.showToast({ title: '刷新失败:'+err.code, icon: 'none'})
  })
}

function onClickItem(e) {
  var idx = e.currentTarget.dataset.idx
  var post = view.data.posts[idx]
  // 跳转到帖子，并设置为已读
  wx.navigateTo({
    url: '/pages/thread/thread?pid=' + post.id,
  })
}

function massage(posts) {
  var i = 0, n = posts.length
  for (; i < n; i++) {
    posts[i] = biz.parsePost(posts[i])
  }
  return posts
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
}