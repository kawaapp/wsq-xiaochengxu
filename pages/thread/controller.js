import api from '../../utils/api.js'
import util from '../../utils/util.js'
const app = getApp()

var view = undefined
function setup(_view) {
  view = _view
}

function onLoad(options) {
  function setup(item) {
    // set post data
    view.setData({
      item: item
    })

    // request comments
    api.getCommentList(item.post.id).then(resp => {
      view.setData({
        comments: formatTimes(resp.data)
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
        title: '加载失败', icon: 'fail'
      })
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
      view.setData({ comments: resp.data })
    }
  }).catch(err => {
    wx.stopPullDownRefresh()
    wx.showToast({
      title: '评论加载失败', icon: 'fail'
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
      comments: comments.concat(resp.data)
    })
  }).catch(err => {
      loader.ing = false
      view.setData({loader: loader})
      wx.showToast({
        title: '加载失败', icon: 'success'
      })
  })
}

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

function onClickListComment(e) {
  console.log('comment on comment click!!')
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

function onClickSendComment(e) {
  console.log("get comment", view.data.reply.text)
  var reply = view.data.reply
  if (util.isWhiteSpace(reply.text)) {
    return
  }
  console.log("reply index:", reply)
  if (reply.index >= 0) {
    commentComment(reply.index)
  } else {
    commentPost({
      post_id: view.data.item.post.id,
      content: view.data.reply.text,
    })
  }
}


// comment on post 
function commentPost(data) {
  if (util.isWhiteSpace(data.content)) {
    console.log("data is empty!")
    return
  }

  // send comment
  api.createComment(data).then(resp => {
    var comments = view.data.comments
    comments.unshift(resp.data)
    view.setData({
      comments: comments,
    })
    view.setData({
      reply: { text: "", index: -1, hint: "", focus: false }
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
      title: '发送失败', icon: 'fail'
    })
    console.log(err)
  })
}

// comment on comment
function commentComment(idx) {
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
    content: view.data.reply.text,
    parent_id: parent.id,
  }

  // send
  api.createComment(data).then(resp => {
    parent.reply_list.push(resp.data)
    view.setData({
      [key]: parent.reply_list
    })
    view.setData({
      reply: { text: "", index: -1, hint: "", focus: false }
    })
    wx.showToast({
      title: '已发送', icon: 'success'
    })
    console.log("评论成功！！！", resp.data)
  }).catch(err => {
    wx.showToast({
      title: '发送失败', icon: 'fail'
    })
    console.log(err)
  })
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


function deletePost(item) {
  api.deletePost(item.id).then(resp => {
    wx.navigateBack({
      delta: 1,
    })
  })
}

function formatTimes(comments) {
  var i = 0, n = comments.length
  for (; i < n; i++) {
    var utc = new Date(comments[i].created_at * 1000)
    comments[i].time = util.formatTime(utc)
  }
  return comments
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickMenu: onClickMenu,
  onClickListComment: onClickListComment,
  onClickListFavor: onClickListFavor,
  onClickSendComment: onClickSendComment,
}