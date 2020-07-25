const api = require('../../../utils/api.js')
const PageSize = 20

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
  api.getUserCommentList(view.data.user.uid, 1, PageSize).then(resp => {
    var hasmore = resp.data && resp.data.length == PageSize
    view.setData({ loading: false, hasmore: hasmore, page: 1 })
    view.setData({ comments: resp.data })
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
  api.getUserCommentList(view.data.user.uid, 1, PageSize).then(resp => {
    var hasmore = resp.data && resp.data.length == PageSize
    view.setData({ loading: false, hasmore: hasmore, page: 1})
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

  var { user, comments, page } = view.data
  view.setData({ loading: true})

  api.getUserCommentList(user.uid, page+1, PageSize).then(resp => {
    var hasmore = resp.data && resp.data.length == PageSize
    view.setData({ hasmore: hasmore, loading: false, page: page+1 })
    view.setData({ comments: comments.concat(resp.data) })
  }).catch(err => {
    view.setData({ loading: false })
    wx.showToast({
      title: '加载失败:'+err.code, icon: 'none',
    })
  })
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
}