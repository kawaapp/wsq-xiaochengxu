const api = require('./utils/api.js')
const biz = require('./utils/biz.js')

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
    messages: {},
    callbacks: {},
  },

  setToken: function( token ) {
    initGlobal(this)
  }
})

function onChange(key, fn) {
  app.globalData.callbacks[key] = fn
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
  biz.getMetaData(data => {
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
    wx.getStorage({
      key: 'tags', success: function (res) {
        setAppData(app, "tags", res.data)
      }
    })
  } catch (e) { }

  api.getTagList().then(resp => {
    setAppData(app, "tags", resp.data)
  })
}

// 获取未读消息
function fetchMessage(app) {
  var uid = app.globalData.userInfo.id
  var checkUneadChat = (uid, items) => {
    console.log("get items:" + uid, items)
    var check = false
    items.map(item => {
      if (item.from.id != uid && item.status === 0) {
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
      wx.setTabBarBadge({ index: 1, text: '' + count })
    }
    if (count == 0) {
      return api.getChatUserList()
    }
  }).then(resp => {
    if (uid && resp.data) {
      if (checkUneadChat(uid, resp.data)) {
        wx.showTabBarRedDot({ index: 1 })
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
  // user
  wx.setStorage({ key: 'user', data: resp.data })
  // tags
  wx.setStorage({ key: 'tags', data: resp.data })

}