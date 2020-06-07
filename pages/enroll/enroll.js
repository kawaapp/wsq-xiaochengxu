const api = require('../../utils/api.js')
const biz = require('../../utils/biz.js')
const util = require('../../utils/util.js')

Page({

  /* 页面的初始数据 */
  data: {
    theme: {
      color: "#1890ff",
    }, 
    enroll: {
    },
    user_data: {
    },
    expired: false,
    enrolled: false,
    showInfo: false,
    showJoin: false,
  },

  /* 生命周期函数--监听页面加载 */
  onLoad: function (options) {
    onLoad(this, options)
  },

  /* 用户点击右上角分享 */
  onShareAppMessage: function () {
    api.logShare({ type: 'share-enroll' })
    // biz
    const { enroll } = this.data
    return {
      title: enroll.title,
      path: `/pages/enroll/enroll?shared=true&id=${enroll.id}`,
      imageUrl: enroll.poster,
    }
  },

  showJoin: function(e) {
    if (!biz.isUserHasName(this)) {
      return
    }
    this.setData({ showJoin: true })
  },

  hideJoin: function(e) {
    this.setData({ showJoin: false})
  },

  showInfo: function(e) {
    this.setData({ showInfo: true })
  },

  hideInfo: function() {
    this.setData({ showInfo: false })
  },

  leave: function() {
    leave(this, this.data.enroll.id)
  },

  submit: function (e) {
    this.setData({ showJoin: false, data: e.detail}, () => {
      takein(this, this.data.enroll.id, e.detail)
    })
  }
})

function onLoad(view, options) {
  // 模拟新用户的场景
  // if (options.shared) {
  //   try {
  //     wx.removeStorageSync('token')
  //   } catch (e) { }
  // }
  if (!options.shared) {
    firstLoad(view, options.id); return
  }

  // shared, login first
  api.autoAuth().then(() => {
    firstLoad(view, options.id)
  }).catch((err) => {
    if (biz.accessNotAllowed(err)) {
      wx.reLaunch({
        url: '/pages/login/login?man=true&private=true',
      })
      return
    }
    wx.showToast({
      title: '打开报名失败:' + err.code, icon: 'none', duration: 2000,
    })
  })
}

function firstLoad(view, id) {
  wx.showLoading()
  api.getEnroll(id).then( resp => {
    wx.hideLoading()
    var enroll = resp.data
    var start = util.prettyTime(new Date(enroll.started_at*1000))
    var end   = util.prettyTime(new Date(enroll.expired_at*1000))
    enroll.startend = `${start}-${end}`
    enroll.timeD = util.getTimeDistance(enroll.deadline)
    var expired = enroll.timeD.e
    try {
      enroll.user_data = JSON.parse(enroll.user_data)
    } catch (err) {/* ignore */}
    view.setData({ enroll, expired})
  }).catch( err => {
    wx.hideLoading()
    console.log("get enrollment", err)
  })

  // get user enroll info
  api.getEnrollUser(id).then( resp => {
    view.setData({ enrolled: true })
  }).catch( err => { /* ingore */ })
}

function takein(view, id, data) {
  api.enrollJoin({enroll_id: id, user_data: JSON.stringify(data)}).then( resp => {
    wx.showToast({
      title: '报名成功！',
    })
    view.setData({ enrolled: true })
  }).catch( err => {
    console.log("enroll join err", err)
    wx.showToast({
      title: '报名失败：' + err.code, icon: "none"
    })
  })
}

function leave(view, id) {
  api.enrollLeave({enroll_id: id}).then( resp => {
    wx.showToast({
      title: '取消成功！',
    })
    view.setData({ enrolled: false, showInfo: false })
  }).catch( err => {
    wx.showToast({
      title: '取消失败：' + err.code, icon: "none"
    })
  })
}