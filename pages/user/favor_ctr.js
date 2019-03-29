const api = require('../../utils/api.js')

var view = undefined
function setup(v) {
  view = v
}

function onLoad(options) {
  if (options && options.uid) {
    view.data.user.uid = options.uid
  }
  api.getUserFavorList(view.data.user.uid).then(resp => {
    console.log("user get favor:", resp)
    view.setData({ favors: resp.data })
  })
}

function onPullDownRefresh() {
  api.getUserFavorList(view.data.user.uid).then(resp => {
    view.setData({ favors: resp.data })
  })
}

function onReachBottom() {
  if (view.data.loader.ing || !view.data.loader.more) {
    return
  }
  var favors = view.data.favors
  var since = 0
  var limit = 20
  if (favors && favors.length > 0) {
    since = favors[favors.length - 1].id
  }
  api.getUserFavorList(view.data.user.uid, since, limit).then(resp => {
    if (resp.data.length < limit) {
      view.data.loader.more = false
    }
    if (resp.data) {
      view.setData({ favors: favors.concat(resp.data) })
    }
  })
}

function onClickItem(e) {
  var idx = e.currentTarget.dataset.idx
  var favor = view.data.favors[idx]
  // 跳转到帖子，并设置为已读
  wx.navigateTo({
    url: '/pages/thread/thread?pid=' + favor.post_id,
  })
}


module.exports = {
  setup: setup,
  onLoad: onLoad,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
}