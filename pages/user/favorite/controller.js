const api = require('../../../utils/api.js')

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
  var loader = view.data.loader
  loader.ing = true
  view.setData({ loader: loader })

  api.getUserFavoriteList(view.data.user.uid, 1, 20).then(resp => {
    loader.ing = false
    if (resp.data && resp.data.length < 20) {
      loader.more = false
    }
    view.setData({ loader: loader })
    view.setData({ posts: resp.data })
  }).catch(err => {
    console.log(err)
    wx.showToast({
      title: '加载失败:' + err.code, icon: 'none'
    })
    loader.ing = false
    view.setData({ loader: loader })
  })
}

function onPullDownRefresh() {
  if (view.data.loader.ing) {
    return
  }

  var loader = {
    ing: true, more: true
  }
  view.setData({ loader: loader })
  view.setData({ page: 1, size: 20})

  api.getUserFavoriteList(view.data.user.uid, 1, 20).then(resp => {
    wx.stopPullDownRefresh()
    var loader = {
      ing: false,
      more: resp.data && resp.data.length === 20
    }
    view.setData({ loader: loader })
    view.setData({ posts: resp.data })
    wx.showToast({
      title: '刷新成功', icon: 'success',
    })
  }).catch(err => {
    wx.stopPullDownRefresh()
    wx.showToast({
      title: '刷新失败:' + err.code, icon: 'none',
    })
    view.setData({ loader: {
      ing: false,
      more: view.data.loader.more
    }})
  })
}

function onReachBottom() {
  if (view.data.loader.ing || !view.data.loader.more) {
    return
  }
  var posts = view.data.posts
  var page = view.data.page + 1
  var size = view.data.size

  var loader = view.data.loader
  loader.ing = true
  view.setData({ loader: loader })
  view.setData({ page: page, size: size})

  api.getUserFavoriteList(view.data.user.uid, page, size).then(resp => {
    loader.ing = false
    if (resp.data.length < size) {
      loader.more = false
    }
    if (resp.data) {
      view.setData({ posts: posts.concat(resp.data) })
    }
    view.setData({ loader: loader })
  }).catch(err => {
    loader.ing = false
    view.setData({ loader: loader })
    wx.showToast({
      title: '加载失败:' + err.code, icon: 'none',
    })
  })
}

function onClickItem(e) {
  var idx = e.currentTarget.dataset.idx
  var post = view.data.posts[idx]

  var goto = pid => {
    wx.navigateTo({
      url: '/pages/thread/thread?pid=' + pid,
    })
  }
  goto(post.id)
}


module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
}