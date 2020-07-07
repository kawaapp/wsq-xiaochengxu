// pages/post/posts.js
const ctr = require('./controller.js')
const kawa = require('../../kawa.js')
const util = require('../../utils/util.js')
const biz = require('../../utils/biz.js')
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
    videoHeight: '225px'
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
  
  clickGoods: function(e) {
    ctr.onClickGoods(e)
  },
  
  clickReplyPost: function(e) {
    ctr.onClickReplyPost(e)
  },

  clickFavor: function(e) {
    ctr.onClikcFavorPost(e)
  },

  clickListItem: function(e) {
    ctr.onClickListItem(e)
  },

  clickListComment: function(e) {
    ctr.onClickListComment(e)
  },

  clickListFavor: function(e) {
    ctr.onClickListFavor(e)
  },
  
  sharePoster: function(e) {
    util.sendRequest('post', this.data.item.post)
    wx.navigateTo({ url: '/pages/poster/poster'})
  },

  showInputDialog: function(params) {
    showInputDialog(this, params)
  },

  threadCancel: function(e) {
    wx.navigateBack()
  }
})

function showInputDialog(view, params) {
  var input = view.selectComponent(".input")
  if (input) {
    input.show(params)
  }
  console.log("show input dialog")
}

