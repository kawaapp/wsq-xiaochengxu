const kawa = require('../../kawa.js')
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

const app = getApp()

// pages/me/edit.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: {
      images: kawa.Theme.Image,
      color: kawa.Theme.MainColor,
    },
    placeholder: kawa.Theme.Image + '/user_icon.png',
    user: {},
    dialog: {
      title: '修改昵称',
      initial: '',
      type: '',
      value: '',
      show: false,
    },
    user_mode: 0,
  },

  
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    const { userInfo, meta } = app.globalData
    this.setData({ user: userInfo, user_mode: meta.user_mode })
  },

  // 页面销毁时执行
  onUnload: function () {
    // save in localStorage, and refresh when lauch
    app.globalData.userInfo = this.data.user
    wx.setStorage({ key: 'user', data: this.data.user })
  },

  // 输入框绑定
  bindInput: function(e) {
    this.data.dialog.value = e.detail.value
  },

  clickCancel: function(e) {
    this.setData({ dialog: {show: false}})
  },

  clickSubmit: function(e) {
    var value = this.data.dialog.value
    var type = this.data.dialog.type
    var data = {}

    if (type === 'nickname' && util.isWhiteSpace(value)) {
      wx.showToast({
        title: '用户名不能为空', icon: 'none'
      })
      return
    }

    if (type === 'nickname') {
      data.nickname = value
    } else if (type === 'email') {
      data.email = value
    } else if (type === 'phone') {
      data.phone =  value
    }
    updateUser(this, data, type)
  },
  
  clickAvatar: function(e) {
    var view = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        if (res.tempFilePaths.length > 0) {
          updateAvatar(view, res.tempFilePaths.pop())
        }
      },
    })
  },

  clickNickname: function(e) {
    this.setData({dialog: { 
      show: true, 
      type: 'nickname', 
      title: '修改昵称',
      initial: this.data.user.nickname,
    }})
  },

  clickEmail: function(e) {
    this.setData({ dialog: { 
        show: true, 
        type: 'email', 
        title: '修改邮箱',
        initial: this.data.user.email,
    } })
  },

  clickPhone: function (e) {
    this.setData({ dialog: {
        show: true,
        type: 'phone',
        title: '修改手机号',
        initial: this.data.user.phone,
      }
    })
  },

  getPhoneNumber: function(e) {
    var view = this
    var ecrypted = e.detail.encryptedData
    var iv = e.detail.iv
    if (ecrypted && iv) {
      biz.getPhoneNumber(ecrypted, iv).then(data => {
        if (!data.purePhoneNumber) {
          wx.showToast({ title: '会话过期，请重试', icon: 'none' })
          return
        }
        var user = app.globalData.userInfo
        user.phone = data.purePhoneNumber
        view.setData({ user: user })
        api.updateUser(user).then(resp => {
          console.log('update user.phone success')
        })
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
  },

  bindUserInfo: function(e) {
    var view = this
    var user = e.detail.userInfo
    if (user) {
      var data = {
        avatar: user.avatarUrl,
        city: user.city,
        gender: user.gender,
        language: user.language,
        nickname: user.nickName
      }
      api.updateUser(data).then((resp) => {
        console.log("授权成功")
        view.setData({ user: resp.data })
        wx.showToast({ 
          title: '同步成功', icon: 'success'
        })
      }).catch( err => {
        console.log('sync err:', err)
        wx.showToast({
          title: '同步失败', icon: 'none'
        })
      })
    }
    console.log(e.detail)
  }

})

function updateUser(view, data, type) {
  api.updateUser(data).then( resp => {
    console.log("update user:", resp)
    view.setData({user: resp.data})
    view.setData({dialog:{show: false}})
    wx.showToast({
      title: '更新成功', icon: 'success'
    })
  }).catch( err => {
    wx.showToast({
      title: '更新失败', icon: 'none'
    })
  })
}

function updateAvatar(view, path) {
  uploadFile(path).then( data => {
    console.log("update file success:" + data)
    data += '?x-oss-process=image/resize,w_250'
    return api.updateUser({avatar: data})
  }).then( resp => {
    view.setData({ user: resp.data})
  }).catch( err => {
    console.log(err)
    wx.showToast({ title: '更新头像失败', icon: "none"})
  })
}

function uploadFile(file) {
  return new Promise((res, rej) => {
    wx.uploadFile({
      url: 'https://kawaapp.com/x/api/images',
      filePath: file,
      name: 'file',
      success: function (resp) {
        if (resp.statusCode == 200) {
          res(resp.data)
        } else {
          rej({ code: resp.statusCode, msg: resp.data })
        }
      },
      fail: function (resp) {
        rej({ code: -1, msg: resp })
      }
    })
  })
}