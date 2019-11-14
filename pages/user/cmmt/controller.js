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

  view.setData({loading: true})
  api.getUserCommentList(view.data.user.uid).then(resp => {
    var hasmore = resp.data && resp.data.length == 20
    view.setData({ loading: false, hasmore: hasmore })
    view.setData({ comments: resp.data })
    console.log("get comment:", resp.data)
  }).catch( err => {
    console.log(err)    
    view.setData({ loading: false })
  })
}

function onPullDownRefresh() {
  if (view.data.loading) {
    return
  }

  view.setData({ loading: true })
  api.getUserCommentList(view.data.user.uid).then(resp => {
    var hasmore = resp.data && resp.data.length == 20
    view.setData({ loading: false, hasmore: hasmore })
    view.setData({ comments: resp.data })
    wx.stopPullDownRefresh()
    wx.showToast({
      title: '刷新成功',
      icon: 'success',
    })
  }).catch( err => {
    view.setData({ loading: false })
    wx.stopPullDownRefresh()
    wx.showToast({
      title: '刷新失败:'+err.code, icon: 'none',
    })
  })
}

function onReachBottom() {
  if (view.data.loadng || !view.data.hasmore) {
    return
  }
  var comments = view.data.comments
  var since = 0
  var limit = 20
  if (comments && comments.length > 0) {
    since = comments[comments.length - 1].id
  }
  view.setData({ loading: true})
  api.getUserCommentList(view.data.user.uid, since, limit).then(resp => {
    var hasmore = resp.data && resp.data.length == limit
    view.setData({ loading: false, hasmore: hasmore })
    view.setData({ comments: comments.concat(resp.data) })
  }).catch(err => {
    view.setData({ loading: false })
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