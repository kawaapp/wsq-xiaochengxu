// pages/login/login.js
import api from '../../utils/api.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    // auto login 
    
  },
  wxlogin: wxLogin
})

function wxLogin() {
  api.autoAuth().then(() => {
    wx.navigateTo({
      url: '/pages/topic/topic',
    })
  }).catch((err) => {
    wx.showToast("登录失败：" + err)
  })
}