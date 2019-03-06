// pages/post/posts.js
import api from '../../utils/api.js'
import util from '../../utils/util.js'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: {
      idx: null,
      post: {},
    },
    comments: [],
    loader: {
      ing: false,
      more: true,
    },
    reply: {
      index: -1,
      hint: "",
      text: "",
      enable: true,
      focus: false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this
    function setup(item) {
      // set post data
      _this.setData({
        item: item
      })

      // request comments
      api.getCommentList(item.post.id).then(resp => {
        _this.setData({
          comments: resp.data
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
      api.getPost(pid).then( resp => {
        setup({ idx: -1, post: resp.data })
      }).catch( err => {
        console.log(err)
      })
    }
  },
  onPullDownRefresh: function(e) {
    if (!this.data.item) {
      return
    }
    var pid = this.data.item.post.id
    api.getCommentList(pid).then( resp => {
      wx.stopPullDownRefresh()
      if (resp.data) {
        this.setData({comments: resp.data})
      }
    }).catch(err => {
      wx.stopPullDownRefresh()
      console.log("comment refresh err")
    })
  },
  onReachBottom: function(e) {
    if (this.data.loader.ing || !this.data.more) {
      return
    }
    var sinceId = 0
    var limit = 20
    var comments = this.data.comments
    if (comments.length > 0) {
      sinceId = comments[comments.length - 1]
    }
    var pid = this.data.item.post.id
    api.getCommentList(pid, sinceId, limit).then(resp => {
      if (resp.data && resp.data.length < limit) {
        this.data.loader.more = false
      }
      this.data.setData({
        comments: comments.concat(resp.data)
      })
    }).catch(err => {

    })
  },
  clickMenu: function (e) {
    var item = this.data.item.post
    var menu = {
      items: ["不感兴趣"],
      actions: [function () { }],
    }
    var user = app.globalData.userInfo
    var _this = this
    if (user && user.id == item.author.id) {
      menu.items.push("删除")
      menu.actions.push(function () {
        deletePost(_this, item)
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
  },
  bindInput: function(e) {
    this.data.reply.text = e.detail.value
  },
  clickMask: function(e) {
    this.setData({
      reply: {
        focus: false,
        index: -1,
        hint: "",
      },
    })
    console.log("focus set false..")
  },
  clickReply: function(e) {
    this.setData({reply:{focus: true}})
  },
  threadCancel: function(e) {
    wx.navigateBack({ delta: 1})
  },
  clickListComment: function(e) {
    console.log('comment on comment click!!')
    // commennt on comment
    var d = this.data
    var idx = e.currentTarget.dataset.idx
    var parent = d.comments[idx]
    d.reply.index = idx
    d.reply.hint = parent.author.nickname
    d.reply.focus = true

    // prepare ui state
    this.setData({
      reply: d.reply
    })
  },
  clickListFavor: function(e) {
    // favor on comment
    var idx = e.currentTarget.dataset.idx
    var comment = this.data.comments[idx]
    if (!comment.stats) {
      comment.stats = {favored: false, favors:0, comments: 0}
    }

    if (comment.stats.favored) {
      unfavorComent(this, idx, comment)
    } else {
      favorComment(this, idx, comment)
    }
  },
  sendComment: function (e) {
    console.log("get comment", this.data.reply.text)
    var reply = this.data.reply
    if (util.isWhiteSpace(reply.text)) {
      return
    }
    console.log("reply index:", reply)
    if (reply.index >= 0) {
      commentComment(this, reply.index)
    } else {
      commentPost(this, {
        post_id: this.data.item.post.id,
        content: this.data.reply.text,
      })
    }
  }
})

// comment on post 
function commentPost(p, data) {
  if (util.isWhiteSpace(data.content)) {
    console.log("data is empty!")
    return
  }

  // send comment
  api.createComment(data).then( resp => {
    var comments = p.data.comments
    comments.unshift(resp.data)
    p.setData({
      comments: comments,
    })
    p.setData({
      reply: {text: "", index: -1, hint: "", focus: false}
    })
    util.setResult({
      ok: true,
      req: 'newcomment',
      idx: p.data.item.idx,
    })
    console.log('set result:' + p.data.idx)

    console.log("评论成功！！！", resp.data)
  }).catch(err => {
    console.log(err)
  })
}

// comment on comment
function commentComment(p, idx) {
  // commennt on comment
  var parent = p.data.comments[idx]
  var key = 'comments[' + idx + '].reply_list'

  // prepare ui state  TODO 这里需要和输入框双向绑定数据..

  if (!parent.reply_list) {
    parent.reply_list = []
  }

  // send data 
  var data = {
    post_id: p.data.item.post.id,
    content: p.data.reply.text,
    parent_id: parent.id,
  }

  // send
  api.createComment(data).then(resp => {
    parent.reply_list.push(resp.data)
    p.setData({ 
      [key]: parent.reply_list 
    })
    p.setData({
      reply: { text: "", index: -1, hint: "", focus: false }
    })
    console.log("评论成功！！！", resp.data)
  }).catch(err => {
    console.log(err)
  })
}


// favor on comment
function favorComment(p, idx, comment) {
  api.createCommentFavor(comment.id).then( resp => {
    var key = 'comments[' + idx + '].stats'
    comment.stats.favored = true
    comment.stats.favors += 1
    p.setData({[key]: comment.stats})
  }).catch( err => {
    console.log(err)
  })
}

function unfavorComent(p, idx, comment) {
  api.deleteCommentFavor(comment.id).then( resp => {
    var key = 'comments[' + idx + '].stats'
    comment.stats.favored = false
    comment.stats.favors -= 1
    p.setData({ [key]: comment.stats })
  }).catch( err => {
    console.log(err)
  })
}

function deletePost(p, item) {
  api.deletePost(item.id).then(resp => {
    wx.navigateBack({
      delta: 1,
    })
  })
}