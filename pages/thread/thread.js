// pages/post/posts.js
const ctr = require('./controller.js')
const kawa = require('../../kawa.js')
const util = require('../../utils/util.js')
const app = getApp()

// 微信原生插屏广告
var interstitialAd = null
function showInterstitialAd(view) {
  if (wx.createInterstitialAd) {
    interstitialAd = wx.createInterstitialAd({
      adUnitId: app.globalData.wxad.detail_inters
    })

    interstitialAd.onLoad((e) => { 
      console.log("ad onload...", e)
    })
    interstitialAd.onError((err) => { 
      console.log("ad erro...", err)
    })
    interstitialAd.onClose((e) => { 
      console.log("ad close...", e)
    })
  }

  setTimeout( () => {
    const wxad = app.globalData.wxad
    // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }
  }, 1000)
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: {
      images: kawa.Theme.Image,
      favorColor: kawa.Theme.FavorColor || kawa.Theme.MainColor,
      color: kawa.Theme.MainColor,
      adminColor: kawa.Theme.MainColor,
      levelColor: util.lightenColor(kawa.Theme.MainColor, 30),
    },
    item: {
      idx: null,
      post: {},
    },
    comments: [],
    loading: false,
    hasmore: true,
    reply: {
      index: -1,
      subindex: -1,
      hint: "",
      text: "",
      image: "",
      enable: true,
      focus: false
    },
    shared: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    ctr.setup(this)
    ctr.onLoad(options)
    
    // show ad
    const wxad = app.globalData.wxad
    if (wxad && wxad.detail_inters_on) {
        showInterstitialAd(this)
    }
  },
  onUnload: function() {
    ctr.onUnload()
  },
  onPullDownRefresh: function(e) {
    ctr.onPullDownRefresh(e)
  },
  onReachBottom: function(e) {
    ctr.onReachBottom(e)
  },
  onShareAppMessage: function (res) {
    return ctr.onClickShare(res)
  },
  clickMenu: function (e) {
    ctr.onClickMenu(e)
  },
  clickImage: function(e) {
    ctr.onClickImage(e)
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
    ctr.onClickReplyPost(e)
  },
  clickFavor: function(e) {
    ctr.onClikcFavorPost(e)
  },
  threadCancel: function(e) {
    ctr.gotoHome()
  },
  clickListComment: function(e) {
    ctr.onClickListComment(e)
  },
  clickListFavor: function(e) {
    ctr.onClickListFavor(e)
  },
  sendComment: function (e, op) {
    ctr.onClickSendComment(e)
  }, 
  clickListCommentAction: function(e) {
    ctr.onClickListCommentAction(e)
  },

  clickPostAvatar: function (e) {
    var post = this.data.item.post
    if (post) {
      gotoUserPage(post.author)
    }
  },

  clickCommentAvatar: function(e) {
    var idx = e.currentTarget.dataset.idx
    var comment = this.data.comments[idx]
    if (comment) {
      gotoUserPage(comment.author)
    }
  },

  sharePoster: function(e) {
    util.sendRequest('post', this.data.item.post)
    wx.navigateTo({ url: '/pages/poster/poster'})
  },

  chooseImage: function(e) {
    chooseImage(this)
  },

  deleteImage: function(e) {
    deleteImage(this)
  },

  bindInput: function(e) {
    var reply = this.data.reply
    reply.text = e.detail.value
    if (e.detail.value && !reply.enable) {
      reply.enable = true
      this.setData({ reply: reply })
    } else if (!e.detail.value && reply.enable) {
      reply.enable = false
      this.setData({ reply: reply })
    }
  },
})

function gotoUserPage(user) {
  if (user) {
    util.sendRequest('user', {
      data: user,
    })
    wx.navigateTo({
      url: '/pages/user/user/user',
    })
  } else {
    wx.showToast({
      title: '用户不存在', icon: 'none'
    })
  }
}

function chooseImage(view) {
  if (view.data.reply.hint) {
    return
  }
  wx.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: function (res) {
      if (res.tempFilePaths.length > 0) {
        var reply = view.data.reply
        reply.image = res.tempFilePaths[0]
        view.setData({ reply: reply })
        console.log("choose images:", res)
      }
    },
  })
}

function deleteImage(view) {
  var reply = view.data.reply
  reply.image = ''
  view.setData({reply: reply})
}
