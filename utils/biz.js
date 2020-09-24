const util = require('util.js')
const api = require('api.js')
const h2j = require('h2j/parser.js')

const app = getApp()


function applyTheme(theme) {
  var imgDir = theme.Image
  wx.setTabBarItem({
    index: 0,
    iconPath: imgDir + "/home.png",
    selectedIconPath: imgDir + "/home_focus.png",
  })
  wx.setTabBarItem({
    index: 1,
    iconPath: imgDir + "/msg.png",
    selectedIconPath: imgDir + "/msg_focus.png",
  })
  wx.setTabBarItem({
    index: 2,
    iconPath: imgDir + "/me.png",
    selectedIconPath: imgDir + "/me_focus.png",
  })

  wx.setTabBarStyle({
    color: "#b5b5b5",
    selectedColor: theme.TabSelectedColor || theme.MainColor,
  })
}

function getPhoneNumber(ecrypted, iv) {
  return new Promise((res, rej) => {
    wx.login({
      success: function (resp) {
        var data = {
          code: resp.code,
          data: ecrypted,
          iv: iv,
        }
        api.decrypt(data).then(resp => {
          res(resp.data)
        }).catch(err => {
          rej({code:2, err: err })
        })
      },
      fail: function (err) {
        rej({code: 1, err: err})
      }
    })
  })
}

// 签到/私信/发帖/评论是写操作，需要用户绑定昵称
function isUserHasName(view) {
  if (app.globalData.userInfo && app.globalData.userInfo.nickname) {
    return true
  }
  var comp = view.selectComponent(".login")
  if (comp) {
    comp.show()
  } else {
    console.log("fatal:can't find login dialog")
  }
}

// 解析 post 以便展示
function parsePost(post) {
  var utcTime = post.created_at * 1000
  post.time = util.formatTime(new Date(utcTime))
  post.agoTime = util.agoTime(utcTime)
  parseRichText(post)
  parseUser(post.author)
  parseMedia(post)
  parseLocation(post)
  return post
}

// 图片在创建2分钟内不予显示，后台系统需要最多2分钟时间
// 才能检测出图片是否违规，否则腾讯的傻X会认为你没有审核
function parseMedia(post) {
  var media = post.media
  if (media) {
    try {
      if (media.type == 1) {
        post.images = JSON.parse(media.path)
      } else if (media.type == 3) {
        post.video = JSON.parse(media.path)
      } else if (media.type == 4) {
        post.link = JSON.parse(media.path)
      } else if (media.type == 5) {
        post.goods = JSON.parse(media.path)
      }
    } catch (err) { }
  }

  // 延迟显示
  var ts = (new Date().getTime()/1000) - 2 * 60
  if (post.images && post.created_at > ts) {
    post.images = post.images.map( () => '/res/auditing.png' )
  }
}

function parseLocation(post) {
  var location = post.location
  if (location) {
    try {
      post.location = JSON.parse(location)
    } catch (err) { }
  }
}

function parseUser(user) {
  if (!user) {
    return {}
  }
  var meta = app.globalData.meta
  if (meta.user_label_admin && user.admin) {
    user.admin_label = true
  }
  if (meta.user_label_level && !user.admin && user.exp_name) {
    user.level_label = 'LV.' + user.exp_level
  }
  return user
}

function parseRichText(post) {
  if (post.title && post.content[0] == '<') {
    post.rich = true
  }
  if (post.rich) {
    const json = h2j.getRichTextJson(post.content)
    var excerpt = "", MAX = 70
    var getText = (node) => {
      if (!node) {
        return
      }
      if (node.type == 'text') {
        var size = excerpt.length + node.text.length
        if (size < MAX) {
          excerpt += node.text
        } else {
          excerpt += node.text.substring(0, MAX - excerpt.length)
          return true
        }
      }
      if (node.children) {
        var i = 0, n = node.children.length
        for (; i < n; i++){
          if (getText(node.children[i])) {
            return true
          }
        }
      }
    }
    getText(json)
    post.excerpt = excerpt
  }
}

// 获取帖子摘要
function postContent(post) {
  var digest = ""
  if (post.title) {
    digest = "[长图文]" + post.title
  } else if (post.content) {
    digest = post.content
  } else if (post.media) {
    if (post.media.type == 1){
      digest = "[图片]"
    } else if (post.media.type == 2) {
      digest = "[音频]"
    } else if (post.media.type == 3) {
      digest = "[视频]"
    } else if (post.media.type == 4) {
      digest = "[链接]" + (getLinkTitle(post.media) || '')
    } 
  }
  return digest
}

function getLinkTitle(media) {
  try {
    return JSON.parse(media.path).title
  } catch(err){}
}

function accessNotAllowed(err) {
  if (err && err == "public access not allowed") {
    return true
  }
  return err && accessNotAllowed(err.err)
}

// 订阅拦截
// usage 1. comment 2. favor 3. chat
// complete(success or fail, err)
function subscribe(trigger, complete) {
  var templates = app.globalData.templates || []
  var filter = []
  if (trigger == 'new-post') {
    filter = templates.filter( t => {
      return t.usage == 1 || t.usage == 2
    })
  } else if (trigger == 'new-comment') {
    filter = templates.filter( t => {
      return t.usage == 1 || t.usage == 2
    })
  } else if (trigger == 'new-chat') {
    filter = templates.filter( t => {
      return t.usage == 3
    })
  } else {
    filter = templates.filter( t => {
      return t.usage >= 1 && t.usage <= 3
    })
  }
  var tids = filter.map( t => {
    return t.template
  })

  wx.requestSubscribeMessage({
    tmplIds: tids,
    success: function(res) {
      var accepts = Object.keys(res).filter(key => {
        return res[key] == 'accept'
      })

      // 部分授权
      if (accepts.length < tids.length) {
        complete && complete(false)
      } else {
        complete && complete(true)
      }

      if (accepts.length > 0) {
        createSubscribes(accepts) // 上传订阅数据
      }
    },
    fail: function(err) {
      complete && complete(false, err)
      console.log("订阅失败：", err)
    },
  })
}

function createSubscribes(tids) {
  tids.length > 0 && api.createUserSub(tids).catch( err => {
    console.log("user subscribe err,", err)
  })
}

// 打开小程序或网页链接
function openLink(data) {
  if (data.path && data.path[0] != '/') {
    data.path = '/' + data.path
  }

  // 如果是网页
  if (data.link && data.link.toLowerCase().startsWith("http")) {
    wx.navigateTo({
      url: '/pages/webview/webview?q=' + encodeURIComponent(data.link),
    })
    return
  }

  // 如果是打开小程序内部页面
  const accountInfo = wx.getAccountInfoSync();
  if (!data.link || data.link == accountInfo.miniProgram.appId) {
    wx.navigateTo({
      url: data.path,
    })
    return
  }
  // 打开外部小程序
  wx.navigateToMiniProgram({
    appId: data.link,
    path: data.path,
  })
}

// 记录Key的访问时间
function logViewTime(key) {
  var viewlog = wx.getStorageSync('viewlog') || {}
  viewlog[key] = Math.round(new Date().getTime()/1000)
  wx.setStorage({ data: viewlog, key: 'viewlog' })
}

module.exports = {
  applyTheme: applyTheme,
  getPhoneNumber: getPhoneNumber,
  isUserHasName: isUserHasName,
  parsePost: parsePost,
  parseUser: parseUser,
  postContent: postContent,
  accessNotAllowed: accessNotAllowed,
  subscribe: subscribe,
  openLink: openLink,
  parseMedia: parseMedia,
  logViewTime: logViewTime,
}