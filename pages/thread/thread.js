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
    var post = util.getRequest("post")
    if (!post) {
      console.log("err, no post found")
      return
    }
   
    // set post data
    this.setData({
      item: post
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
    // send comment
    var data = {
      pid: this.data.item.post.id,
      text: this.data.reply.text,
    }
    api.createComment(data).then( resp => {
      var comments = this.data.comments
      comments.unshift(resp.data)
      this.setData({
        comments: comments
      })
      util.setResult({
        ok: true,
        req: 'newcomment',
        idx: this.data.item.idx,
      })
      console.log('set result:' + this.data.idx)

      console.log("评论成功！！！", resp.data)
    }).catch(err => {
      console.log(err)
    })
  },
  threadCancel: function(e) {
    wx.navigateBack({ delta: 1})
  },
})