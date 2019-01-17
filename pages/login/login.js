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
  onLoad: function (options) {
    api.autoLogin('ntop', '123')
  },
})