import api from '../../utils/api.js'
const kawa = require('../../kawa.js')

Page({
  // 页面的初始数据
  data: {
    theme: {
      color: kawa.Theme.MainColor,
    },
    meta: {},
    user: {},
    text: '',
    join: {}, 
  },

  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    api.getAppMeta().then( resp => {
      this.setData({ meta: resp.data })
    }).catch( err => {
      console.log(err)
      wx.showToast({ title: '社区信息加载失败！', icon: 'none' })
    })
    fetchJoinState(this)
  },

  onShow: function() {
    fetchJoinState(this)
  },

  clickJoin: function() {
    join(this)
  },

  bindText: function (e) {
    this.setData({ text: e.detail.value })
  },

  bindUserInfo: function(e) {
    var userInfo = e.detail.userInfo
    var user = {
      avatar : userInfo.avatarUrl,
      city : userInfo.city,
      gender : userInfo.gender,
      language : userInfo.language,
      nickname : userInfo.nickName,
    }
    this.setData({ user: user })
  },

  getPhoneNumber: function() {
  //   var ecrypted = e.detail.encryptedData
  //   var iv = e.detail.iv
  //   if (ecrypted && iv) {
  //     biz.getPhoneNumber(ecrypted, iv).then(data => {
  //       console.log("get data success:", data)
  //       if (!data || !data.purePhoneNumber) {
  //         wx.showToast({ title: '会话过期, 请重试' })
  //         return
  //       }
  //       var user = view.data.user
  //       user.phone = data.purePhoneNumber
  //       view.setData({ user: user })
  //       enableButton(view)
  //     }).catch(err => {
  //       if (err.code && err.code == 2) {
  //         wx.showToast({ title: '手机号解密失败', icon: 'none' })
  //       } else {
  //         wx.showToast({ title: '绑定手机号失败', icon: 'none' })
  //       }
  //       console.log(err)
  //     })
  //   } else {
  //     wx.showToast({ title: '绑定手机号失败:0', icon: 'none' })
  //   }
  },
})

// 获取申请状态
function fetchJoinState(view) {
  wx.login({
    success: function (resp) {
      if (resp.code) {
        api.getJoinRequest({ code: resp.code }).then(resp => {
          try {
            const user = JSON.parse(resp.data.data)
            view.setData({ user: user })
          } catch(e){}
          var req = resp.data
          if (req.status == 2 && !req.user) {
            req.status = undefined
          }
          view.setData({ join: resp.data })
          if (req.status == 2 && req.user) {
            wx.showToast({
              title: '恭喜，您已成功加入社区！', icon: 'none'
            })
          } else if (req.status == 1) {
            wx.showToast({
              title: '抱歉，管理员拒绝了您的请求！', icon: 'none'
            })
          }
        })
      }
    },
    fail: function (err) {
      console.log(err)
      wx.showToast({ title: '微信授权失败！', icon: 'none' })
    },
  })
}

// 加入社区
function join(view) {
  const { join, user, text } = view.data
  if (join.status == 2 && join.user) {
    wx.navigateBack({ delta: 1 })
    return
  }

  if (!user.nickname) {
    wx.showToast({
      title: '请绑定微信昵称', icon: 'none',
    })
    return
  }

  // create reuqest
  const reqJoin = (code) => {
    var data = {
      data: JSON.stringify(user),
      text: text,
      name: user.nickname,
      code: code,
    }
    api.createJoinRequest(data).then(resp => {
      view.setData({ tip: "", join: resp.data })
      wx.showToast({ title: '申请发送成功!', icon: 'none' })
    }).catch(err => {
      console.log(err)
      wx.showToast({ title: '申请发送失败!', icon: 'none' })
    })
  }

  // get code
  wx.login({
    success: function (resp) {
      if (resp.code) {
        reqJoin(resp.code)
      }
    },
    fail: function (err) {
      console.log(err)
      wx.showToast({ title: '微信授权失败！', icon: 'none' })
    },
  })
}