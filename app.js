const api = require('./utils/api.js')

//app.js
App({
  onLaunch: function (options) {
    // 或许可以把缓存数据的加载提前到这里..
    // 根据屏幕计算合适的图片大小
    // 原始图片按 750px 计算，大屏 * 1.5倍
    var info = wx.getSystemInfoSync()
    var px = info.screenWidth * info.pixelRatio
    var scale = 1
    if (px >= 1080) {
      scale = 1.5
    }
    this.globalData.ratio = scale
    console.log("get system info:", info)
  },
  globalData: {
    ratio: 1,
    transit: {
      post: null
    },
    // App data
    posts: [],
    meta: {},
    userInfo: {},
    topics: [],
    signed: undefined,
  }
})