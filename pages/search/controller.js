const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const biz = require('../../utils/biz.js')
const app = getApp()

var view = undefined

// Home Controller 
function setup(_view) {
  view = _view
}

// First Load
function onLoad(opt) {
  
}

// search
function onClickSearch() {
  const { query } = view.data
  view.setData({ loading: true })
  api.searchPost({ keyword: query,  }).then( resp => {
    const data = resp.data.items || [] 
    view.setData({ loading: false, page: 1, hasmore: data && data.length == 20})
    view.setData({ posts: massage(data)})
    console.log("get search result:", resp)
  }).catch( err => {
    view.setData({ loading: false, page: 1, hasmore: true })
    console.log("search err,", err)
  })
}

function doSearch(q) {

  api.searchPost({}).then( resp => {

  })
}

// cancel
function onClickCancel() {
  wx.navigateBack({
    delta: 1,
  })
}

// more
function onReachBottom() {
  if (view.data.loading || !view.data.hasmore) {
    return
  }
  const { query, page, posts } = view.data
  view.setData({ loading: true })
  api.searchPost({ keyword: query, page: page+1 }).then(resp => {
    const data = resp.data.items || [] 
    view.setData({ loading: false, page: page+1, hasmore: data && data.length == 20 })
    view.setData({ posts: posts.concat(massage(data)) })
  }).catch(err => {
    view.setData({ loading: false })
    wx.showToast({ title: '刷新失败:' + err.code, icon: 'none' })
  })
}

function massage(posts) {
  var result = []
  var author = app.globalData.userInfo

  for (var i = 0; i < posts.length; i++) {
    var post = posts[i]
    var hide = (post.status >> 2) & 1

    // 如是本人的帖子则不隐藏
    if (post.author && author && post.author.id == author.id) {
      hide = false
    }

    // 如果是需要审核的帖子，即使本人也不显示直到已审核
    // 因为微信审核人员会傻缺的以为你没有审核系统...
    if ((post.status >> 3) & 1) {
      hide = true
    }

    if (!hide) {
      result.push(biz.parsePost(post))
    }
  }
  return result
}


module.exports = {
  setup: setup,
  onLoad: onLoad,
  onClickSearch: onClickSearch,
  onClickCancel: onClickCancel,
  onReachBottom: onReachBottom,
}