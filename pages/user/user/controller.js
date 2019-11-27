import api from '../../../utils/api.js'
import util from '../../../utils/util.js'
import biz from '../../../utils/biz.js'

const app = getApp()
const PAGE_SIZE = 20

var view = undefined
function setup(v) {
  view = v
}
function onUnload() {
  view = undefined
}

function onLoad(options) {
  var req = util.getRequest("user")
  var user = req.data
  user.days = util.getDaysFromNow(user.created_at)
  view.setData({ user: user })

  // follow state
  fetchFollow(user.id)

  // fetch post
  fetchPostList(user.id)
}

function onReachBottom() {
  fetchMorePost()
}

function fetchFollow(uid) {
  api.isFollowing(uid).then( resp => {
    console.log(resp)
    view.setData({ follow: true})
  }).catch( err => {
    console.log(err)
  })
}

function fetchPostList(uid) {
  view.setData({loading: true})

  // fetch data 
  api.getUserPostList(uid).then(resp => {
    console.log("user get posts:", resp)
    var posts = massage(resp.data)
    view.setData({ posts: posts })
    view.setData({ loading: false, hasmore: resp.data && resp.data.length === PAGE_SIZE })
  }).catch(err => {
    console.log(err)
    wx.showToast({
      title: '加载失败:' + err.code, icon: 'none'
    })
    view.setData({ loading: false })
  })
}

function fetchMorePost() {
  if (view.data.loading || !view.data.hasmore) {
    return
  }
  var posts = view.data.posts
  var since = 0
  var limit = PAGE_SIZE
  if (posts && posts.length > 0) {
    since = posts[posts.length - 1].id
  }
  view.setData({ loading: true })
  api.getUserPostList(view.data.user.id, since, limit).then(resp => {
    var data = massage(resp.data)
    view.setData({ loading: false, hasmore: resp.data && resp.data.length == limit })
    view.setData({ posts: posts.concat(data) })
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


function onClickSend() {
  if (!biz.isUserHasName(view)) {
    return
  }
  var user = view.data.user
  util.sendRequest('user', user)
  wx.navigateTo({
    url: '/pages/chat/chat?uid=' + user.id,
  })
}

function onClickItem(e) {
  var idx = e.currentTarget.dataset.idx
  var post = view.data.posts[idx]
  util.sendRequest('post', {
    idx: idx,
    post: post
  })
  wx.navigateTo({
    url: '/pages/thread/thread',
  })
}

function onClickFollow(e) {
  if(!biz.isUserHasName(view)) {
    return
  }

  var { user } = view.data
  console.log("get user:", user)
  if (view.data.follow) {
    api.unfollow(user.id).then( resp => {
      view.setData({ follow: false})
      wx.showToast({
        title: '取消成功', icon: 'success'
      })
    }).catch(err => {
      console.log(err)
      wx.showToast({
        title: '取消失败:' + err.code,
      })
    })
  } else {
    api.follow(user.id).then( resp => {
      view.setData({ follow: true})
      wx.showToast({
        title: '关注成功', icon: 'success'
      })
    }).catch(err => {
      console.log(err)
      wx.showToast({
        title: '关注失败:' + err.code,
      })
    })
  }
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
  onClickSend: onClickSend,
  onClickFollow: onClickFollow,
}