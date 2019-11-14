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
  view.setData({loading: true})
  api.getUserFavorList(view.data.user.uid).then(resp => {
    var hasmore = resp.data && resp.data.length == 20
    view.setData({ loading: false, hasmore: hasmore })
    view.setData({ favors: resp.data })
  }).catch( err => {
    console.log(err)
    wx.showToast({
      title: '加载失败:'+err.code, icon: 'none'
    })
    view.setData({ loading: false })
  })
}

function onPullDownRefresh() {
  if (view.data.loading) {
    return
  }
  view.setData({ loading: true })
  api.getUserFavorList(view.data.user.uid).then(resp => {
    var hasmore = resp.data && resp.data.length === 20
    view.setData({ loading: false, hasmore: hasmore })
    view.setData({ favors: resp.data })
    wx.stopPullDownRefresh()
    wx.showToast({
      title: '刷新成功', icon: 'success',
    })
  }).catch( err => {
    wx.stopPullDownRefresh()
    wx.showToast({
      title: '刷新失败:'+err.code, icon: 'none',
    })
    view.setData({ loading: false})
  })
}

function onReachBottom() {
  if (view.data.loading || !view.data.hasmore) {
    return
  }
  var favors = view.data.favors
  var since = 0
  var limit = 20
  if (favors && favors.length > 0) {
    since = favors[favors.length - 1].id
  }
  view.setData({loading: true})
  api.getUserFavorList(view.data.user.uid, since, limit).then(resp => {
    var hasmore = resp.data && resp.data.length == limit
    if (resp.data) {
      view.setData({ favors: favors.concat(resp.data) })
    }
    view.setData({loading: false, hasmore: hasmore})
  }).catch( err=> {
    view.setData({loading: false})
    wx.showToast({
      title: '加载失败:'+err.code, icon: 'none',
    })
  })
}

function onClickItem(e) {
  var idx = e.currentTarget.dataset.idx
  var favor = view.data.favors[idx]

  var goto = pid => {
    wx.navigateTo({
      url: '/pages/thread/thread?pid=' + pid,
    })
  }

  // 如果赞的是帖子，直接跳转
  if (favor.entity_type == 0) {
    goto(favor.entity_id)
  } 

  // 如果赞的是评论，先从评论取得帖子再跳转
  if (favor.entity_type == 1) {
    api.getComment(favor.entity_id).then( resp => {
      goto(resp.data.post_id)
    }).catch( err => {
      console.log(err)
    })
  }
}


module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
}