const kawa = require('../../kawa.js')
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')
const biz = require('../../utils/biz.js')
const app = getApp()

// pages/me/bind.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: {
      images: kawa.Theme.Image,
      color: kawa.Theme.MainColor,
    },
    user: {
      avatar: '',
      nickname: '',
      gender: 0,
      summary: '',
      phone: '',
      language: '',
    }, 
    step: 0,
    skipPhone: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.login({
      success: function (resp) {
        console.log("refresh login:", resp.code)
      }  
    })
  },

  bindUserInfo: function(e) {
    bindUserInfo(this, e)
  },

  clickNext: function(e) {
    if (this.data.user.nickname) {
      this.setData({ step: 1 })
    } else {
      wx.showToast({title: '需要绑定昵称', icon: 'none'})
    }
  },

  clickPrev: function(e) {
    this.setData({step: 0})
  },

  getPhoneNumber: function(e) {
    bindPhoneNumber(this, e)
    console.log("get user phone", e)
  },

  clickFinish: function(e) {
    var user = this.data.user
    if (!user.phone && !this.data.skipPhone) {
      wx.showToast({ title: '需要绑定手机号', icon: 'none'})
      return
    }
    updateUser(user)
  },
})

function bindUserInfo(view, e) {
  var user = e.detail.userInfo
  if (user) {
    var data = {
      avatar: user.avatarUrl,
      city: user.city,
      gender: user.gender,
      language: user.language,
      nickname: user.nickName
    }
    view.setData({ user: data })
  }
}

function bindPhoneNumber(view, e) {
  var ecrypted = e.detail.encryptedData
  var iv = e.detail.iv
  if (ecrypted && iv) {
    biz.getPhoneNumber(ecrypted, iv).then(data => {
      console.log("get data success:", data)
      if (!data || !data.purePhoneNumber) {
        wx.showToast({ title: '会话过期, 请重试'})
        return
      }
      var user = view.data.user
      user.phone = data.purePhoneNumber
      view.setData({ user: user })
    }).catch(err => {
      if (err.code && err.code == 2) {
        wx.showToast({ title: '手机号解密失败', icon: 'none' })
      } else {
        wx.showToast({ title: '绑定手机号失败', icon: 'none' })
      }
      console.log(err)
    })
  } else {
    wx.showToast({ title: '绑定手机号失败:0', icon: 'none' })
  }
}

function updateUser(data) {
  api.updateUser(data).then((resp) => {
    // update global cache
    app.globalData.userInfo = resp.data

    // update local storage
    wx.setStorage({
      key: 'user',
      data: resp.data,
    })
    console.log('update user ok:', resp)

    // refresh me.page
    util.setResult({
      req: 'update-user',
      ok: resp.statusCode == 200,
    })

    // finish!
    wx.navigateBack({ delta: 1 })
  }).catch( err => {
    console.log(err)
    wx.showToast({ title: '更新用户资料失败', icon: 'none' })
  })
}
