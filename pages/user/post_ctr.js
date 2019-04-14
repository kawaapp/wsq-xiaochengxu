const api = require('../../utils/api.js')

var view = undefined
function setup(v) {
  view = v
}

function onLoad(options) {
  if (options && options.uid) {
    view.data.user.uid = options.uid
  }
  api.getUserPostList(view.data.user.uid).then(resp => {
    console.log("user get posts:", resp)
    view.setData({ posts: resp.data })
  })
}

function onPullDownRefresh() {
  api.getUserPostList(view.data.user.uid).then(resp => {
    view.setData({ posts: resp.data })
    wx.stopPullDownRefresh()
    wx.showToast({
      title: '刷新成功',
      icon: 'success',
    })
  }).catch( err => {
    wx.stopPullDownRefresh()
    wx.showToast({ title: '刷新失败', icon: 'none'})
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
    view.setData({ loader: loader })
    view.setData({ posts: posts.concat(resp.data) })
  }).catch( err=> {
    loader.ing = false
    view.setData({ loader: loader })
    wx.showToast({ title: '刷新失败', icon: 'none'})
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


module.exports = {
  setup: setup,
  onLoad: onLoad,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
}