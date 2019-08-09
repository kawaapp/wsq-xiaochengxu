import api from '../../utils/api.js'
import util from '../../utils/util.js'
import biz from '../../utils/biz.js'
const app = getApp()

var view = undefined
function setup(_view) {
  view = _view
}

function onUnload() {
  view = undefined
}

function onLoad(options) {
  if (options.shared) {
    view.setData({ shared: options.shared })
  }
  
  // 非分享链接，直接打开
  if (!options.shared) {
    fetch(options)
    return
  } 
  
  // 如果是分享的链接，需要先登录，并初始化一些全局变量
  api.autoAuth().then(() => {
    fetch(options)
    initGlobal()
  }).catch((err) => {
    wx.showToast({
      title: '帖子打开失败:' + err.code, icon: 'none', duration: 2000,
    })
  })
}

function fetch(options) {
  function setup(item) {
    var utc = item.post.created_at * 1000
    item.post.agoTime = util.agoTime(utc)
    if (item.post.media) {
      if (item.post.media.type === 1) {
        item.post.images = JSON.parse(item.post.media.path)
      } else if (item.post.media.type === 3) {
        item.post.video = JSON.parse(item.post.media.path)
      }
    }
    if (item.post.location) {
      try {
        item.post.location = JSON.parse(item.post.location)
      } catch(err){}
    }

    // set post data
    view.setData({
      item: item
    })

    // request comments
    api.getCommentList(item.post.id).then(resp => {
      view.setData({
        comments: massage(resp.data)
      })
      console.log("get comment data:", resp.data)
    }).catch(err => {
      console.log('thread:', err)
    })
  }
  var item = util.getRequest("post")
  if (item) {
    setup(item)
    return
  }
  var pid = options.pid
  if (pid) {
    api.getPost(pid).then(resp => {
      setup({ idx: -1, post: resp.data })
    }).catch(err => {
      console.log(err)
      wx.showToast({
        title: '加载失败:'+err.code, icon: 'none'
      })
    })
  }
}

function initGlobal() {
  // user
  if (!app.globalData.userInfo.nickname) {
    api.getSelf().then((resp) => {
      app.globalData.userInfo = resp.data
      // refresh local storage
      wx.setStorage({ key: 'user', data: resp.data })
    })
  }

  // meta
  if (!app.globalData.meta.app_name) {
    biz.getMetaData(data => {
      app.globalData.meta = data
    })
  }
}

function onPullDownRefresh(e) {
  if (!view.data.item) {
    return
  }
  var pid = view.data.item.post.id
  api.getCommentList(pid).then(resp => {
    wx.stopPullDownRefresh()
    if (resp.data) {
      view.setData({ comments: massage(resp.data)})
    }
  }).catch(err => {
    wx.stopPullDownRefresh()
    wx.showToast({
      title: '评论加载失败:'+err.code, icon: 'none'
    })
    console.log("comment refresh err")
  })
}

function onReachBottom(e) {
  if (view.data.loader.ing || !view.data.more) {
    return
  }
  var sinceId = 0
  var limit = 20
  var comments = view.data.comments
  if (comments.length > 0) {
    sinceId = comments[comments.length - 1]
  }
  var loader = view.data.loader
  var pid = view.data.item.post.id
  loader.ing = true
  view.setData({loader: loader})
  api.getCommentList(pid, sinceId, limit).then(resp => {
    loader.ing = false
    if (resp.data && resp.data.length < limit) {
      loader.more = false
    }
    view.setData({loader: loader})
    view.setData({
      comments: comments.concat(massage(resp.data))
    })
  }).catch(err => {
      loader.ing = false
      view.setData({loader: loader})
      wx.showToast({
        title: '加载失败:'+err.code, icon: 'success'
      })
  })
}

// ------- 针对帖子的动作 ---------

// 点击帖子菜单
function onClickMenu(e) {
  var item = view.data.item.post
  var menu = {
    items: ["举报"],
    actions: [function () { 
      wx.showToast({
        title: '举报成功',
        icon: 'success',
      })
    }],
  }
  var user = app.globalData.userInfo
  if (user && user.id == item.author.id) {
    menu.items.push("删除")
    menu.actions.push(function () {
      deletePost(item)
    })
  }
  showActionSheet(menu.items, menu.actions)
}

// 删除帖子
function deletePost(item) {
  api.deletePost(item.id).then(resp => {
    // req refresh
    util.setResult({ ok: true })
    
    // goto home
    gotoHome()
  })
}

// 返回首页
function gotoHome() {
  if (!view.data.shared) {
    wx.navigateBack({ delta: 1 })
  } else {
    wx.switchTab({ url: '/pages/home/home' })
  }
}

// 对帖子点赞、取消点赞
function onClikcFavorPost(e) {
  var updateFavorState = (p) => {
    view.setData({ item: { post: p } })
  }
  var p = view.data.item.post
  if (p.stats && p.stats.favored) {
    api.deletePostFavor(p.id).then(resp => {
      p.stats.favored = 0
      if (p.stats.favors > 0) {
        p.stats.favors -= 1
      }
      updateFavorState(p)
    }).catch(err => {
      wx.showToast({
        title: '发送失败:'+err.code, icon: 'none'
      })
      console.log(err)
    })
  } else {
    api.createPostFavor(p.id).then(resp => {
      p.stats.favored = 1
      p.stats.favors += 1
      updateFavorState(p)
    }).catch(err => {
      wx.showToast({
        title: '发送失败:'+err.code, icon: 'none'
      })
      console.log(err)
    })
  }
}

// 对帖子评论
function onClickReplyPost(e) {
  if (!biz.isUserHasName()){
    return
  }
  view.setData({ reply: { focus: true } })
}

// --------- 对评论的动作 ---------

// 对评论点赞、取消点赞
function onClickListFavor(e) {
  // favor on comment
  var idx = e.currentTarget.dataset.idx
  var comment = view.data.comments[idx]
  if (!comment.stats) {
    comment.stats = { favored: false, favors: 0, comments: 0 }
  }

  if (comment.stats.favored) {
    unfavorComent(idx, comment)
  } else {
    favorComment(idx, comment)
  }
}

// favor on comment
function favorComment(idx, comment) {
  api.createCommentFavor(comment.id).then(resp => {
    var key = 'comments[' + idx + '].stats'
    comment.stats.favored = true
    comment.stats.favors += 1
    view.setData({ [key]: comment.stats })
  }).catch(err => {
    console.log(err)
  })
}

function unfavorComent(idx, comment) {
  api.deleteCommentFavor(comment.id).then(resp => {
    var key = 'comments[' + idx + '].stats'
    comment.stats.favored = false
    comment.stats.favors -= 1
    view.setData({ [key]: comment.stats })
  }).catch(err => {
    console.log(err)
  })
}

// 对评论进行回复菜单
function onClickListComment(e) {
  if (!biz.isUserHasName()){
    return
  }

  // commennt on comment
  var d = view.data
  var idx = e.currentTarget.dataset.idx
  var parent = d.comments[idx]
  d.reply.index = idx
  d.reply.hint = parent.author.nickname
  d.reply.focus = true

  // prepare ui state
  view.setData({
    reply: d.reply
  })
}

function onClickListCommentAction(e) {
  var idx = e.currentTarget.dataset.idx
  var array = idx.split('-')
  var index = array[0], sub = array[1]

  var actionDelete = function() {
    if (!biz.isUserHasName()) {
      return;
    }
    deleteComment(index, sub)
  }

  var actionReply = function() {
    if (!biz.isUserHasName()) { 
      return; 
    }
    // commennt on comment
    var d = view.data
    var hint 
    if (!sub) {
      hint = d.comments[index].author.nickname
    } else {
      hint = d.comments[index].reply_list[sub].author.nickname
    }
    d.reply.index = index
    d.reply.subIndex = sub
    d.reply.hint = hint
    d.reply.focus = true

    // prepare ui state
    view.setData({
      reply: d.reply
    })
  }

  var menu = {
    items: ["回复"],
    actions: [actionReply],
  }
  // 是否显示删除菜单
  var uid = undefined
  if (sub) {
    uid = view.data.comments[index].reply_list[sub].author.id
  } else {
    uid = view.data.comments[index].author.id
  }
  var user = app.globalData.userInfo
  if (user && user.id == uid) {
    menu.items.push("删除")
    menu.actions.push(actionDelete)
  }
  showActionSheet(menu.items, menu.actions)
}

function deleteComment(index, sub) {
  var item = {}
  if (sub) {
    var reply_list = view.data.comments[index].reply_list
    var key = 'comments[' + index + '].reply_list'

    item.id = reply_list[sub].id
    item.action = function() {
      reply_list.splice(sub, 1)
      view.setData({
        [key]: reply_list
      })
    }
  } else {
    var comments = view.data.comments
    item.id = comments[index].id
    item.action = function() {
      comments.splice(index, 1)
      view.setData({
        comments: comments,
      })
    }
  }
  api.deleteComment(item.id).then( resp => {
    item.action()
    wx.showToast({
      title: '删除成功', icon: 'none'
    })
  }).catch( err => {
    wx.showToast({
      title: '删除失败:'+err.code, icon: 'none'
    })
    console.log(err)
  })
}

// 发送评论，针对帖子、回复、回复的回复
function onClickSendComment(e) {
  var text = e.detail.value
  if (util.isWhiteSpace(text)) {
    wx.showToast({
      title: '评论不能为空', icon: 'none',
    })
    return
  }

  var reply = view.data.reply
  if (reply.index >= 0) {
    replyToComment(text, reply.index, reply.subIndex)
  } else {
    replyToPost(text)
  }
}


// comment on post 
function replyToPost(replyText) {
  var post = view.data.item.post
  var data = {
    content: replyText,
    post_id: post.id,
    reply_id: post.author.id
  }

  // send comment
  api.createComment(data).then(resp => {
    formatTime(resp.data)
    var comments = view.data.comments
    comments.unshift(resp.data)
    view.setData({
      comments: comments,
    })
    view.setData({
      reply: { text: "", index: -1, subindex: -1, hint: "", focus: false }
    })
    util.setResult({
      ok: true,
      req: 'newcomment',
      idx: view.data.item.idx,
    })
    wx.showToast({
      title: '发送成功', icon: 'success'
    })
    console.log('set result:' + view.data.idx)
    console.log("评论成功！！！", resp.data)
  }).catch(err => {
    wx.showToast({
      title: '发送失败:'+err.code, icon: 'none'
    })
    console.log(err)
  })
}

// 回复评论和评论的评论
function replyToComment(text, idx, subIndex) {
  // commennt on comment
  var parent = view.data.comments[idx]
  var key = 'comments[' + idx + '].reply_list'

  // prepare ui state  TODO 这里需要和输入框双向绑定数据..

  if (!parent.reply_list) {
    parent.reply_list = []
  }

  // send data 
  var data = {
    post_id: view.data.item.post.id,
    parent_id: parent.id,
  }

  // 评论的评论, 藏一个字符用来标识评论之评论
  // TODO
  // 为了简化后端逻辑，在此处隐藏一个不可见字符
  // 来标识当前回复是不是针对回复的回复
  var replier = undefined
  if (subIndex && parent.reply_list.length > subIndex) {
    var reply = parent.reply_list[subIndex]
    data.reply_id = reply.author.id
    data.content = '\r' + text
    replier = reply.author
  } else {
    data.reply_id = parent.author.id
    data.content = text
  }

  // send
  api.createComment(data).then(resp => {
    if (subIndex) {
      resp.data.reply = true
      resp.data.replier = replier
    }
    parent.reply_list.push(resp.data)
    view.setData({
      [key]: parent.reply_list
    })
    view.setData({
      reply: { text: "", index: -1, subindex: -1, hint: "", focus: false }
    })
    wx.showToast({
      title: '已发送', icon: 'success'
    })
    console.log("评论成功！！！", resp.data)
  }).catch(err => {
    wx.showToast({
      title: '发送失败:'+err.code, icon: 'none'
    })
    console.log(err)
  })
}


function massage(comments) {
  var i = 0, n = comments.length
  for (; i < n; i++) {
    var utc = new Date(comments[i].created_at * 1000)
    comments[i].time = util.formatTime(utc)
    var reply_list = comments[i].reply_list
    comments[i].reply_list = decorateReplyList(reply_list)
  }
  return comments
}

function decorateReplyList(list) {
  if (list) {
    var i = 0, n = list.length
    for (; i < n; i++) {
      if (list[i].content && list[i].content[0] == `\r`) {
        list[i].reply = true
      }
    }
    return list
  }
}

function formatTime(item) {
  var utc = new Date(item.created_at * 1000)
  item.time = util.formatTime(utc)
}

function showActionSheet(menus, actions) {
  wx.showActionSheet({
    itemList: menus,
    success: function (res) {
      var fn = actions[res.tapIndex]
      if (fn) { fn() }
    },
    fail: function (res) {
      console.log(res.errMsg)
    }
  })
}

function onClickShare(res) {
  // 来自页面内转发按钮
  if (res.from === 'button') {
    console.log(res.target)
  }
  var post = view.data.item.post
  var image = undefined
  if (post.images && post.images.length > 0) {
    image = post.images[0]
  }
  return {
    title: post.content,
    path: '/pages/thread/thread?shared=true&pid='+ post.id,
    imageUrl: image,
  }
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickMenu: onClickMenu,
  onClickReplyPost: onClickReplyPost,
  onClickListComment: onClickListComment,
  onClickListFavor: onClickListFavor,
  onClickSendComment: onClickSendComment,
  onClikcFavorPost: onClikcFavorPost,
  onClickListCommentAction: onClickListCommentAction,
  onClickShare: onClickShare,
  gotoHome: gotoHome,
}