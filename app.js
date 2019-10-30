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
  onHide: function() {
    save(this)
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
    tags: [],
    signed: undefined,
    messages: {
      chat: 0,
      notification: 0,
    },
    callbacks: {},
  },

  setToken: function( token ) {
    initGlobal(this)
  },

  onChange: function(key, fn) {
    onChange(this, key, fn)
  },
})

function onChange(app, key, fn) {
  app.globalData.callbacks[key] = fn
  // first load
  var data = app.globalData[key]
  fn(data)
}

function setAppData(app, key, data) {
  app.globalData[key] = data
  const fn = app.globalData.callbacks[key]
  if (fn) {
    fn(data)
  }
}

function initGlobal(app) {
  console.log("init global:", app)
  fetchAppData(app)
  fetchUserData(app)
  fetchTags(app)
  fetchSignToday(app)
  fetchMessage(app)
  fetchGradeData(app)
}

// 加载社区信息
function fetchAppData(app) {
  try {
    const value = wx.getStorageSync('meta')
    if (value) {
      setAppData(app, "meta", value)
    }
  } catch (e) {}

  api.getMetaData().then(resp => {
    var data = { ... resp.data }
    if (resp.data.user_mode) {
      data.user_mode = parseInt(resp.data.user_mode, 10)
    } else {
      data.user_mode = 0
    }
    if (resp.data.app_exp_limit) {
      data.app_exp_limit = parseInt(resp.data.app_exp_limit, 10)
    } else {
      data.app_exp_limit = 0
    }
    setAppData(app, "meta", data)
  })
}

// 用户信息
function fetchUserData(app) {
  // 用户状态
  try {
    const value = wx.getStorageSync('user')
    if (value) {
      setAppData(app, "userInfo", value)
    }
  } catch (e) {
    // Do something when catch error
  }
  api.getSelf().then((resp) => {
    setAppData(app, "userInfo", resp.data)
  })
}

// 签到状态
function fetchSignToday(app) {
  api.getSignToday().then(resp => {
    setAppData(app, "signed", resp.data.ok)
  }).catch(err => {
    console.log(err)
  })
}

// 话题列表
function fetchTags(app) {
  try {
    const value = wx.getStorageSync('tags')
    if (value) {
      setAppData(app, "tags", value)
    }
  } catch (e) { }

  api.getTagList().then(resp => {
    setAppData(app, "tags", resp.data)
  })
}

// 获取未读消息
function fetchMessage(app) {
  var uid = app.globalData.userInfo.id
  var checkUneadChat = (uid, items) => {
    var check = false
    items.map(item => {
      if (item.from_id != uid && item.status === 0) {
        console.log("get checked item:", item)
        check = true
      }
    })
    return check
  }

  // 先点赞评论消息后聊天
  api.getMessageCount().then((resp) => {
    var count = resp.data.favors + resp.data.comments
    if (count > 0) {
      setAppData(app, "messages", { notification: count })
    }
    if (count == 0) {
      return api.getChatUserList()
    }
  }).then(resp => {
    if (uid && resp.data) {
      if (checkUneadChat(uid, resp.data)) {
        setAppData(app, "messages", { chat: 1})
      }
    }
  }).catch(err => {
    console.log(err)
  })
}

function fetchGradeData(app) {
  
}

// 持久化关键信息
function save(app) {
  // meta
  wx.setStorage({ key: 'meta', data: app.globalData.meta })
  // user
  wx.setStorage({ key: 'user', data: app.globalData.userInfo })
  // tags
  wx.setStorage({ key: 'tags', data: app.globalData.tags })
}