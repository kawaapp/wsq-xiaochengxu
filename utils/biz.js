const util = require('util.js')
const api = require('api.js')
const h2j = require('h2j/parser.js')

const app = getApp()

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

// 最低级别需要经验应该为 0 
// 否则初始的时候无法获得等级
function getGrade(grades, exp) {
  if (!grades || grades.length == 0) {
    return
  }

  // 从小到大排列
  grades.sort((a, b) => {
    return a.level > b.level
  })

  // 遇到第一个满足条件的等级时退出
  // 得到当前对应的等级
  for (var i = grades.length-1; i >= 0; i--) {
    if (exp >= grades[i].need_exp) {
      return i
    }
  }
  return
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
      }
    } catch (err) { }
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
  var grades = app.globalData.grades
  if (meta.user_label_level && !user.admin && grades) {
    var i = getGrade(grades, user.exp_count)
    if (i != undefined) {
      user.level_label = 'LV.' + grades[i].level
    }
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

module.exports = {
  getPhoneNumber: getPhoneNumber,
  getGrade: getGrade,
  isUserHasName: isUserHasName,
  parsePost: parsePost,
  parseUser: parseUser,
  postContent: postContent,
  accessNotAllowed: accessNotAllowed,
}