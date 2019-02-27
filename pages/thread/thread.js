// pages/post/posts.js
import api from '../../utils/api.js'
import util from '../../utils/util.js'

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
      text: "",
      focus: false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var item = util.getRequest("post")
    if (!item) {
      console.log("err, no post found")
      return
    }
   
    // set post data
    this.setData({
      item: item
    })

    // request comments
    api.getCommentList(item.post.id).then(resp => {
      this.setData({
        comments: resp.data
      })
      console.log("get comment data:", resp.data)
    }).catch(err => {
      console.log('thread:', err)
    })
  },
  onPullDownRefresh: function(e) {
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
  bindInput: function(e) {
    this.data.reply.text = e.detail.value
  },
  clickReply: function(e) {
    this.setData({reply:{focus: true}})
  },
  sendComment: function(e) {
    console.log("get comment", this.data.reply.text)
    commentPost(this, {
      post_id: this.data.item.post.id,
      content: this.data.reply.text,
    })
  },
  threadCancel: function(e) {
    wx.navigateBack({ delta: 1})
  },
  commentClick: function(e) {
    console.log('comment on comment click!!')
    commentComment(this, e.currentTarget.dataset.idx)
  },
  favorClick: function(e) {
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
  }
})

// comment on post 
function commentPost(p, data) {
  // send comment
  api.createComment(data).then( resp => {
    var comments = p.data.comments
    comments.unshift(resp.data)
    p.setData({
      comments: comments
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
  p.setData({
    reply: { focus: true, text: '@' + parent.author.nickname }
  })
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