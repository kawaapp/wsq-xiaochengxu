const api = require('../../../utils/api.js')

var view = undefined
function setup(_view) {
  view = _view
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
  view.setData({loader: loader})
  api.getUserCommentList(view.data.user.uid).then(resp => {
    loader.ing = false
    if (resp.data && resp.data.length < 20) {
      loader.more = false
    }
    view.setData({ loader: loader })
    view.setData({ comments: resp.data })
    console.log("get comment:", resp.data)
  }).catch( err => {
    console.log(err)
    loader.ing = false
    view.setData({ loader: loader })
  })
}

function onPullDownRefresh() {
  if (view.data.loader.ing) {
    return
  }

  var loader = view.data.loader
  loader.ing = true
  view.setData({ loader: loader })

  api.getUserCommentList(view.data.user.uid).then(resp => {
    loader.ing = false
    if (resp.data && resp.data.length < 20) {
      loader.more = false
    }
    view.setData({ loader: loader })
    view.setData({ comments: resp.data })
    wx.stopPullDownRefresh()
    wx.showToast({
      title: '刷新成功',
      icon: 'success',
    })
  }).catch( err => {
    loader.ing = false
    view.setData({ loader: loader })
    wx.stopPullDownRefresh()
    wx.showToast({
      title: '刷新失败:'+err.code, icon: 'none',
    })
  })
}

function onReachBottom() {
  if (view.data.loader.ing || !view.data.loader.more) {
    return
  }
  var comments = view.data.comments
  var since = 0
  var limit = 20
  if (comments && comments.length > 0) {
    since = comments[comments.length - 1].id
  }
  var loader = view.data.loader
  loader.ing = true
  view.setData({ loader: loader})
  api.getUserCommentList(view.data.user.uid, since, limit).then(resp => {
    loader.ing = false
    if (resp.data.length < limit) {
      loader.more = false
    }
    view.setData({ loader: loader })
    view.setData({ comments: comments.concat(resp.data) })
  }).catch(err => {
    loader.ing = false
    view.setData({ loader: loader })
    wx.showToast({
      title: '加载失败:'+err.code, icon: 'none',
    })
  })
}

function onClickItem(e) {
  var idx = e.currentTarget.dataset.idx
  var comment = view.data.comments[idx]
  // 跳转到帖子，并设置为已读
  wx.navigateTo({
    url: '/pages/thread/thread?pid=' + comment.post_id,
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