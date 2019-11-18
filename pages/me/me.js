const ctr = require('./controller.js') 
const kawa = require('../../kawa.js')
const util = require('../../utils/util.js')

// pages/me/me.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: {
      images: kawa.Theme.Image,
      color: kawa.Theme.MainColor,
      gradeColor: util.lightenColor(kawa.Theme.MainColor, 0),
    },
    user: {
      avatar: '',
      nickname: '小虾米',
      summary: '啦啦啦 我是卖报的小行家',
    }, 
    expLabel: '',
    copyright: "",
    support: true,
    metadata: {
      user_mode: 0, // 0, 1, 2
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    ctr.setup(this)
    ctr.onLoad(options)
  },

  onUnload: function() {
    ctr.onUnload()
  },
  onShow: function () {
    ctr.onShow()
  },
  // 从其它页面返回数据
  onResult: function (data) {
    ctr.onResult(data)
  },
  bindUserInfo: function (e) {
    ctr.bindUserInfo(e)
  },
  getPhoneNumber: function (e) {
    ctr.getPhoneNumber(e)
  },
  postClick: function(e) {
    wx.navigateTo({
      url: '/pages/user/post/post',
    })
  },
  commentClick: function(e) {
    wx.navigateTo({
      url: '/pages/user/cmmt/comment',
    })
  },
  favorClick: function(e) {
    wx.navigateTo({
      url: '/pages/user/favor/favor',
    })
  },

  favoriteClick: function(e) {
    wx.navigateTo({
      url: '/pages/user/favorite/favorite',
    })
  },

  followClick: function(e) {
    wx.navigateTo({
      url: '/pages/user/friend/friend',
    })
  },

  clickBindProfile: function(e) {
    var comp = this.selectComponent(".login")
    if (comp) {
      comp.show()
    } else {
      console.log("fatal:can't find login dialog")
    }
  },

  clickExp: function(e) {
    wx.navigateTo({
      url: '/pages/exp/exp',
    })
  },

  clickEdit: function(e) {
    wx.navigateTo({
      url: '/pages/me/edit',
    })
  },

  onOk: function(e) {
    const user = e.detail
    this.setData({ user: user })
  }
})