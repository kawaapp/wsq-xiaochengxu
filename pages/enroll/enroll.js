const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

Page({

  /* 页面的初始数据 */
  data: {
    theme: {
      color: "#1890ff",
    }, 
    enroll: {
    },
    expired: false,
    enrolled: false,
    showInfo: false,
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

  click: function(e) {
    takein(this, this.data.enroll.id)
  },

  getInfo: function(e) {
    this.setData({ showInfo: true })
  },

  clickClose: function() {
    this.setData({ showInfo: false })
  },

  clickCancel: function() {
    leave(this, this.data.enroll.id)
  }
})

function onLoad(view, options) {
  api.autoAuth().then(()=> {
    firstLoad(view, options.id)
  })
}

function firstLoad(view, id) {
  api.getEnroll(id || 1).then( resp => {
    var enroll = resp.data
    var start = util.prettyTime(new Date(enroll.started_at*1000))
    var end   = util.prettyTime(new Date(enroll.expired_at*1000))
    enroll.startend = `${start}-${end}`
    enroll.timeD = util.getTimeDistance(enroll.deadline)
    var expired = enroll.timeD.e
    view.setData({ enroll, expired})
  }).catch( err => {
    console.log("get enrollment", err)
  })

  // get user enroll info
  api.getEnrollUser(id || 1).then( resp => {
    view.setData({ enrolled: true })
  }).catch( err => { /* ingore */ })
}

function takein(view, id) {
  api.enrollJoin({enroll_id: id}).then( resp => {
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