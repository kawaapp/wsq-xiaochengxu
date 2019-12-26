// pages/login/login.js
import api from '../../utils/api.js'
const kawa = require('../../kawa.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: {
      color: kawa.Theme.MainColor,
    },
    visible: false,
    timeout: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.man) {
      // 如果是重定向过来的，需要手动点击登录.
      this.setData({ visible: true})

      // 如果是私有社区，转到申请页面
      if (options.private) {
        wx.navigateTo({ url: '/pages/join/join' })
      }
    } else {
      // auto login 
      api.autoAuth().then(() => {
        console.log("go to main page")
        wx.switchTab({
          url: '/pages/home/home',
        })
      }).catch((err) => {
        if (accessNotAllowed(err.err)) {
          wx.navigateTo({
            url: '/pages/join/join',
          })
          this.setData({ visible: true })
          return
        }
        wx.showToast({
          title: '自动登录失败:' + err.code, icon: 'none', duration: 2000,
        })
        this.setData({ visible: true })
      })
    }
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
      if (accessNotAllowed(err.err)) {
        wx.navigateTo({
          url: '/pages/join/join',
        })
        return
      }
      wx.showToast({
        title: '登录失败:' + err.code, icon: 'none', duration: 2000,
      })
    })
  },
})

function accessNotAllowed(err) {
  if (err && err == "public access not allowed") {
    return true
  }
  return err && accessNotAllowed(err.err)
}