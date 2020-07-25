import api from '../../utils/api.js'
import util from '../../utils/util.js'
import biz from '../../utils/biz.js'
import meu from '../../utils/meu.js'
import h2j from '../../utils/h2j/parser.js'

const app = getApp()
const PageSize = 20

var view = undefined
function setup(_view) {
  view = _view
}

function onUnload() {
  view = undefined
}

function onLoad(options) {
  // 模拟新用户的场景
  // if (options.shared) {
  //   try {
  //     wx.removeStorageSync('token')
  //   } catch (e) { }
  // }
  if (options.shared) {
    view.setData({ shared: options.shared })
  }
  
  // 非分享链接，直接打开
  if (!options.shared) {
    fetch(options)
    return
  } 
  
  // 如果是分享的链接，需要先登录
  api.autoAuth().then(() => {
    fetch(options)
  }).catch((err) => {
    if (biz.accessNotAllowed(err)) {
      wx.reLaunch({
        url: '/pages/login/login?man=true&private=true',
      })
      return
    }
    wx.showToast({
      title: '帖子打开失败:' + err.code, icon: 'none', duration: 2000,
    })
  })
}

function fetch(options) {
  function setup(item) {
    var utc = item.post.created_at * 1000
    item.post.agoTime = util.agoTime(utc)

    // parse media
    biz.parseMedia(item.post)

    // parse rich text
    if (item.post.title && item.post.content[0] == '<') {
      item.post.rich = true
      const json = h2j.getRichTextJson(item.post.content)
      item.post.nodes = json.children
    }

    if (item.post.location) {
      try {
        item.post.location = JSON.parse(item.post.location)
      } catch(err){}
    }
    if (item.post.author) {
      item.post.author = biz.parseUser(item.post.author)
    }

    // adjust video 
    if (item.post.video) {
      const { width, height } = item.post.video
      if (width) {
        var h = Math.round(702*height/width)
        h = h > 650 ? 650: h
        h = h < 395 ? 395: h
        view.setData({ videoHeight: `${h}rpx` })
      }
    }

    // set post data
    view.setData({
      item: item
    })

    // request comments
    api.getCommentList(item.post.id, 1, PageSize).then(resp => {
      var hasmore = resp.data && resp.data.length == PageSize
      view.setData({
        comments: massage(resp.data), hasmore, page: 1,
      })
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
      console.log("get post err:" + pid, err)
      wx.showToast({
        title: '加载失败:'+err.code, icon: 'none'
      })
    })
  }
}

function onPullDownRefresh(e) {
  if (!view.data.item) {
    return
  }
  var pid = view.data.item.post.id
  api.getCommentList(pid, 1, PageSize).then(resp => {
    wx.stopPullDownRefresh()
    if (resp.data) {
      var hasmore = resp.data.length == 20 
      view.setData({ 
        comments: massage(resp.data), hasmore, page: 1
      })
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
  if (view.data.loading || !view.data.hasmore) {
    return
  }
  var { item, comments, page } = view.data
  view.setData({loading: true})

  api.getCommentList(item.post.id, page+1, PageSize).then(resp => {
    var hasmore= resp.data && resp.data.length == PageSize
    view.setData({ loading: false, hasmore, page: page+1})
    view.setData({
      comments: comments.concat(massage(resp.data))
    })
  }).catch(err => {
      view.setData({loading: false})
      wx.showToast({
        title: '加载失败:'+err.code, icon: 'success'
      })
  })
}

function onClickImage(e) {
  var index = e.target.dataset.idx
  var images = view.data.item.post.images
  wx.previewImage({
    urls: images,
    current: images[index],
  })
}

function onClickGoods(e) {
  var goods = view.data.item.post.goods
  if (goods) {
    biz.openLink({link: goods.link, path: goods.path})
  }
}

// ------- 针对帖子的动作 ---------

// 点击帖子菜单
function onClickMenu(e) {
  var item = view.data.item.post
  var menu = meu.create(item)

  var user = app.globalData.userInfo
  var isAuthor = user && item.author && user.id == item.author.id
  var isAdmin = user && user.admin

  // author or admin can delete post
  if (isAdmin || isAuthor) {
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
  if (!biz.isUserHasName(view)){
    return
  }
  view.showInputDialog({
    success: (value) => {
      replyToPost(view, value)
    }
  })
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
  if (!biz.isUserHasName(view)){
    return
  }
  var idx = e.currentTarget.dataset.idx
  var item = view.data.comments[idx]

  if (!item.author) {
    wx.showToast({ title: '用户不存在！', icon: "none" })
    return
  }

  view.showInputDialog({
    hint: item.author.nickname,
    success: function(value) {
      replyToComment(view, idx, value)
    }
  })
}

// 点击上下文菜单
function onClickListItem(e) {
  var idx = e.currentTarget.dataset.idx
  var item = view.data.comments[idx]
  var menu = {
    items: [],
    actions: [],
  }

  // 回复菜单
  menu.items.push("回复")
  menu.actions.push(() => {
    if (!biz.isUserHasName(view)) { 
      return; 
    }
    if (!item.author) {
      wx.showToast({ title: '用户不存在！', icon: "none" })
      return
    }
    view.showInputDialog({
      hint: item.author.nickname,
      success: (value) => {
        replyToComment(view, idx, value)
      }
    })
  })

  // 删除菜单
  var user = app.globalData.userInfo
  if (user && user.id == item.author_id) {
    menu.items.push("删除")
    menu.actions.push(() => {
      deleteComment(view, idx)
    })
  }

  // 拉起菜单
  wx.showActionSheet({
    itemList: menu.items,
    success: function (res) {
      var fn = menu.actions[res.tapIndex]
      if (fn) { fn() }
    },
    fail: function (res) {
      console.log(res.errMsg)
    }
  })
}

function deleteComment(view, idx) {
  var { comments } = view.data
  var item = comments[idx]
  api.deleteComment(item.id).then( resp => {
    comments.splice(idx, 1)
    view.setData({ comments })
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

// 回复评论
function replyToComment(view, idx, value) {
  var item = view.data.comments[idx]
  // send data 
  var data = {
    post_id: item.post_id,
    parent_id: item.id,
    reply_id: item.author.id,
    content: value.text,
  }

  // send
  api.createComment(data).then(resp => {
    var sublist = item.reply_list || []
    sublist.push(resp.data)
    view.setData({ [`comments[${idx}].reply_list`]: sublist })
    wx.showToast({
      title: '已发送', icon: 'success'
    })
  }).catch(err => {
    wx.showToast({
      title: '发送失败:'+err.code, icon: 'none'
    })
    console.log(err)
  })
}

// 回复帖子
function replyToPost(view, value) {
  var post = view.data.item.post
  var data = {
    content: value.text,
    post_id: post.id,
    reply_id: post.author.id
  }

  var handler = undefined

  // upload image if exist 
  var file = value.image
  if (file) {
    handler = api.uploadFile(file).then( url => {
      console.log("upload file success", url)
      var m = {
        type: 1,
        path: `["${url}"]`
      }
      return api.createMedia(m)
    }).then( resp => {
      console.log("create media success", resp.data)
      data.media_id = resp.data.id
      return api.createComment(data)
    })
  } else {
    handler = api.createComment(data)
  }

  // send comment
  handler.then(resp => {
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

function massage(comments) {
  var i = 0, n = comments.length
  for (; i < n; i++) {
    formatTime(comments[i])
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
  if (item.media) {
    try {
      var images = JSON.parse(item.media.path)
      item.image = images[0]
    } catch(err){}
  }
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
  // 不精确的分享统计
  api.logShare({type: 'share-post'})

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
  onClickImage: onClickImage,
  onClickGoods: onClickGoods,
  onClickMenu: onClickMenu,
  onClickReplyPost: onClickReplyPost,
  onClickListItem: onClickListItem,
  onClickListComment: onClickListComment,
  onClickListFavor: onClickListFavor,
  onClikcFavorPost: onClikcFavorPost,
  onClickShare: onClickShare,
}