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
  bindUserInfo: function(e) {
    console.log(e.detail)
  }, 
  wxlogin: wxLogin,
})

function wxLogin() {
  api.autoAuth().then(() => {
    console.log("go to mani page")
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