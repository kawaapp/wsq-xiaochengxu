const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const app = getApp()

var view = undefined

// Home Controller 
function setup(_view) {
  view = _view
}

// First Load
function onLoad(opt) {
  // 加载社区信息
  api.getMetaData().then(resp => {
    view.setData({
      meta: resp.data
    })
    console.log("get meta:", resp.data)
  })

  // 进入第一次加载
  api.getTopicList().then(resp => {
    view.setData({
      posts: decoratePosts(resp.data)
    })
  }).catch(err => {
    console.log("topic", err)
  })

  // 用户信息
  api.getSelf().then((resp) => {
    app.globalData.userInfo = resp.data
  })
}

function onResult(data) {
  if (data && data.ok) {
    if (data.req == 'newpost') {
      // data.post
      // 新增帖子到列表头部
      var post = data.data
      post.styled = util.decorateText(post.content)
      view.data.posts.unshift(post)
      view.setData({
        posts: view.data.posts
      })
    } else if (data.req == 'newcomment') {
      // 刷新评论数量
      var item = view.data.posts[data.idx]
      var key = 'posts[' + data.idx + '].stats'
      if (!item.stats) {
        item.stats = {}
      }
      if (item.stats.comments) {
        item.stats.comments += 1
      } else {
        item.stats.comments = 1
      }
      view.setData({ [key]: item.stats })
    }
  }
  console.log('home, on result data:' + data)
}

// 下拉事件
function onPullDownRefresh() {
  api.getTopicList().then((resp) => {
    wx.stopPullDownRefresh()
    view.setData({
      posts: decoratePosts(resp.data)
    })
    console.log(resp.data[0])
  }).catch((err) => {
    wx.stopPullDownRefresh()
    console.log(err)
  })
}

function onReachBottom() {
  if (view.data.loader.ing || !view.data.loader.more) {
    return
  }

  var posts = view.data.posts
  var sinceId = 0
  var limit = 20
  if (posts && posts.length > 0) {
    sinceId = posts[posts.length - 1].id
  }
  api.getTopicList(sinceId, limit).then((resp) => {
    view.data.loader.ing = false
    if (resp.data) {
      if (resp.data.length < 20) {
        console.log("no more data..." + sinceId)
        view.data.loader.more = false
      }
      var styled = decoratePosts(resp.data)
      view.setData({
        posts: posts.concat(styled)
      })
    }
  }).catch((err) => {
    view.data.loader.ing = false
  })
}

function onClickFavor(e) {
  var idx = e.currentTarget.dataset.idx
  var item = view.data.posts[idx]
  var key = 'posts[' + idx + '].stats'

  if (!item.stats) {
    item.stats = { favored: false, favors: 0, comments: 0 }
  }

  if (item.stats.favored && item.stats.favored > 0) {
    console.log("delete favor")
    api.deletePostFavor(item.id).then(resp => {
      item.stats.favored = false,
        item.stats.favors -= 1
      this.setData({ [key]: item.stats })
      console.log("delete favor:", resp.statusCode)
    })
  } else {
    console.log("create favor")
    api.createPostFavor(item.id).then((resp) => {
      item.stats.favors += 1
      item.stats.favored = true
      view.setData({ [key]: item.stats })
      console.log("favor fail:", resp.statusCode)
    }).catch(err => {
      console.log("favor err:", err)
    })
  }
}

function onClickMenu(e) {
  var idx = e.currentTarget.dataset.idx
  var item = view.data.posts[idx]
  var menu = {
    items: ["不感兴趣"],
    actions: [function () { }],
  }
  var user = app.globalData.userInfo
  if (user && user.id == item.author.id) {
    menu.items.push("删除")
    menu.actions.push(function () {
      deletePost(view, idx)
    })
  }

  wx.showActionSheet({
    itemList: menu.items,
    success: function (res) {
      console.log(JSON.stringify(res))
      console.log(res.tapIndex) // 用户点击的按钮，从上到下的顺序，从0开始
      var fn = menu.actions[res.tapIndex]
      fn()
    },
    fail: function (res) {
      console.log(res.errMsg)
    }
  })
}

function decoratePosts(posts) {
  for (var i = 0; i < posts.length; i++) {
    posts[i].styled = util.decorateText(posts[i].content)
    var utc = new Date(posts[i].created_at * 1000)
    posts[i].time = util.formatTime(utc)
  }
  return posts
}

function deletePost(idx) {
  var posts = view.data.posts
  var post = posts[idx]
  api.deletePost(post.id).then(resp => {
    posts.splice(idx, 1)
    view.setData({ posts: posts })
    console.log("删除成功")
  }).catch(err => {
    console.log("删除失败")
  })
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onResult: onResult,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickFavor: onClickFavor,
  onClickMenu: onClickMenu,
}