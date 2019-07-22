const api = require('./utils/api.js')

//app.js
App({
  onLaunch: function (options) {
    // 不清楚, app.globalData 的生命周期
    // 或许可以把缓存数据的加载提前到这里..
  },
  globalData: {
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