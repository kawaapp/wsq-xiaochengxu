import api from '../../../utils/api.js'
import util from '../../../utils/util.js'
import biz from '../../../utils/biz.js'

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

  // fetch post
  fetchPostList(user.id)
}

function onReachBottom() {
  fetchMorePost()
}

function fetchPostList(uid) {
  view.setData({loader: {
    ing: true, more: true,
  }})

  // fetch data 
  api.getUserPostList(uid).then(resp => {
    console.log("user get posts:", resp)
    var loader = {
      ing: false,
      more: resp.data && resp.data.length === PAGE_SIZE
    }
    var posts = decorateList(resp.data)
    view.setData({ posts: resp.data })
    view.setData({ loader: loader })
  }).catch(err => {
    console.log(err)
    wx.showToast({
      title: '加载失败:' + err.code, icon: 'none'
    })
    loader.ing = false
    view.setData({ loader: loader })
  })
}

function fetchMorePost() {
  if (view.data.loader.ing || !view.data.loader.more) {
    return
  }
  var posts = view.data.posts
  var since = 0
  var limit = PAGE_SIZE
  if (posts && posts.length > 0) {
    since = posts[posts.length - 1].id
  }
  var loader = view.data.loader
  loader.ing = true
  view.setData({ loader: loader })
  api.getUserPostList(view.data.user.uid, since, limit).then(resp => {
    loader.ing = false
    if (resp.data.length < limit) {
      loader.more = false
    }
    var data = decorateList(resp.data)
    view.setData({ loader: loader })
    view.setData({ posts: posts.concat(data) })
  }).catch(err => {
    loader.ing = false
    view.setData({ loader: loader })
    wx.showToast({ title: '刷新失败:' + err.code, icon: 'none' })
  })
}

function decorateList(posts) {
  var i = 0, n = posts.length
  for (; i < n; i++) {
    var utcTime = posts[i].created_at * 1000
    posts[i].time = util.formatTime(new Date(utcTime))
    if (posts[i].media) {
      if (posts[i].media.type === 1) {
        posts[i].images = JSON.parse(posts[i].media.path)
      } else if (posts[i].media.type === 3) {
        posts[i].video = JSON.parse(posts[i].media.path)
      }
    }
    if (posts[i].location) {
      try {
        posts[i].location = JSON.parse(posts[i].location)
      } catch (err) { }
    }
  }
  return posts
}



function onClickSend() {
  if (!biz.isUserHasName('')) {
    return
  }
  var user = this.data.user
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

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
  onClickSend: onClickSend,
}