const api = require('../../utils/api.js')

var view = undefined
function setup(_view) {
  view = _view
}

function onLoad(options) {
  if (options && options.uid) {
    view.data.user.uid = options.uid
  }
  api.getUserCommentList(view.data.user.uid).then(resp => {
    view.setData({ comments: resp.data })
  })
}

function onPullDownRefresh() {
  api.getUserCommentList(view.data.user.uid).then(resp => {
    view.setData({ comments: resp.data })
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
  api.getUserCommentList(view.data.user.uid, since, limit).then(resp => {
    if (resp.data.length < limit) {
      view.data.loader.more = false
    }
    view.setData({ comments: comments.concat(resp.data) })
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
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
}