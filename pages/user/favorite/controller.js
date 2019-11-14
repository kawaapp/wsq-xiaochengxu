const api = require('../../../utils/api.js')
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
  view.setData({ loading: true })
  api.getUserFavoriteList(view.data.user.uid, 1, 20).then(resp => {
    view.setData({ loading: false, hasmore: resp.data && resp.data.length == 20 })
    view.setData({ posts: massage(resp.data) })
  }).catch(err => {
    console.log(err)
    wx.showToast({
      title: '加载失败:' + err.code, icon: 'none'
    })
    view.setData({ loading: false })
  })
}

function onPullDownRefresh() {
  if (view.data.loading) {
    return
  }

  view.setData({ loading: true, hasmore: true })
  view.setData({ page: 1, size: 20})

  api.getUserFavoriteList(view.data.user.uid, 1, 20).then(resp => {
    wx.stopPullDownRefresh()
    view.setData({ loading: false, hasmore: resp.data && resp.data.length === 20 })
    view.setData({ posts: massage(resp.data) })
    wx.showToast({
      title: '刷新成功', icon: 'success',
    })
  }).catch(err => {
    wx.stopPullDownRefresh()
    wx.showToast({
      title: '刷新失败:' + err.code, icon: 'none',
    })
    view.setData({ loading: false })
  })
}

function onReachBottom() {
  if (view.data.loading || !view.data.hasmore) {
    return
  }
  var posts = view.data.posts
  var page = view.data.page + 1
  var size = view.data.size

  view.setData({ loading: true })
  view.setData({ page: page, size: size})

  api.getUserFavoriteList(view.data.user.uid, page, size).then(resp => {
    if (resp.data) {
      const decorated = massage(resp.data)
      view.setData({ posts: posts.concat(decorated) })
    }
    view.setData({ loading: false, hasmore: resp.data && resp.data.length == size  })
  }).catch(err => {
    view.setData({ loading: false })
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

function massage(items) {
  return items.map( item => {
    item.content = biz.postContent(item)
    return item
  })
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
}