// pages/login/login.js
import api from '../../utils/api.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    visible: false,
    timeout: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {  
    // auto login 
    api.autoAuth().then(() => {
      console.log("go to main page")
      wx.switchTab({
        url: '/pages/home/home',
      })
    }).catch((err) => {
        wx.showToast({
          title: '自动登录失败:' + err.code, icon: 'none', duration: 2000,
        })
        this.setData({ visible: true })
    })
  }, 

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // delay 2 seconds to show loading
    var view = this
    setTimeout(function () {
      view.setData({ timeout: true })
    }, 2000);
  },

  // 手动点击登录
  clickLogin: function() {
    api.autoAuth().then(() => {
      console.log("go to main page")
      wx.switchTab({
        url: '/pages/home/home',
      })
    }).catch ((err) => {
      wx.showToast({
        title: '登录失败:' + err.code, icon: 'none', duration: 2000,
      })
    })
  },
  bindUserInfo: function(e) {
    var user = e.detail.userInfo
    if (user) {
      var data = {
        avatar: user.avatarUrl,
        city: user.city,
        gender: 1,
        language: user.language,
        nickname: user.nickName
      }
      console.log(user)
      api.updateUser(data).then((resp) => {
        if (resp.statusCode == 200) {
          console.log("授权成功")

          console.log(resp.data)
        }
      })
    }
    console.log(e.detail)
  }, 
  wxlogin: wxLogin,
})

function wxLogin() {
  api.autoAuth().then(() => {
    console.log("go to main page")
    // wx.navigateTo({
    //   url: '/pages/topic/topic',
    // })
    wx.navigateBack({
      delta:1
    })
  }).catch((err) => {
    wx.showToast("登录失败：" + err)
  })
}
