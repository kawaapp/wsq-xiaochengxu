const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
const biz = require('../../../utils/biz.js')
const PageSize = 20

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
  view.setData({loading: true})

  // fetch data 
  api.getUserPostList(view.data.user.uid, 1, PageSize).then(resp => {
    var hasmore = resp.data && resp.data.length == PageSize
    view.setData({ posts: massage(resp.data) })
    view.setData({ loading: false, hasmore, page: 1 })
  }).catch( err => {
    console.log(err)
    wx.showToast({
      title: '加载失败:'+err.code, icon: 'none'
    })
    view.setData({loading: false})
  })
}

function onPullDownRefresh() {
  if (view.data.loading) {
    return
  }

  // show loading
  view.setData({ loading: true })

  // fetch data
  api.getUserPostList(view.data.user.uid, 1, PageSize).then(resp => {
    var hasmore = resp.data && resp.data.length === 20
    var data = massage(resp.data)
    view.setData({ posts: data })
    view.setData({ loading: false, hasmore, page: 1 })
    wx.stopPullDownRefresh()
    wx.showToast({
      title: '刷新成功',
      icon: 'success',
    })
  }).catch( err => {
    wx.stopPullDownRefresh()
    wx.showToast({ title: '刷新失败:'+err.code, icon: 'none'})
    view.setData({ loading: false })
  })
}

function onReachBottom() {
  if (view.data.loading || !view.data.hasmore) {
    return
  }

  var { user, posts, page } = view.data
  view.setData({loading: true})

  api.getUserPostList(user.uid, page+1, PageSize).then(resp => {
    var hasmore = resp.data && resp.data.length == PageSize
    var data = massage(resp.data)
    view.setData({ loading: false, hasmore, page: page+1 })
    view.setData({ posts: posts.concat(data) })
  }).catch( err=> {
    view.setData({ loading: false })
    wx.showToast({ title: '刷新失败:'+err.code, icon: 'none'})
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
}