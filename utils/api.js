const util = require('util.js')
const kawa = require('../kawa.js')

// ALL server-side API
//const Host = "http://127.0.0.1:1323"
//const Host = "https://wsq.siftapi.com"
const Host = "https://wsq.kawaapp.com"
const AppKey = kawa.AppKey

let g = {
  token: "",
}

// setup promise
/**
 * promise请求
 * 参数：参考wx.request
 * 返回值：[promise]res
 */
function req(options = {}) {
  const {
    url,
    data,
    method,
    dataType,
    responseType,
    success,
    fail,
    complete
  } = options;

  // inject token
  const header = Object.assign({
    'Authorization': `Bearer ${g.token}`,
    'AppKey': AppKey, 
  }, options.header);

  return new Promise((res, rej) => {
    wx.request({
      url,
      data,
      header,
      method,
      dataType,
      responseType,
      success(r) {
        if (r.statusCode == 200) {
          res(r);
        } else if (r.statusCode == 401) {
          console.log("invalid token: 401")
          // 给调用端返回一个空集，形成完整的调用链
          res({data: []})
          // 拦截并处理错误
          loginExpired()
        } else {
          rej({ code: r.statusCode, err: r.data })
        }
      },
      fail(err) {
        rej({ code: -1, err: err });
      },
      complete
    });
  });
}

// 重定向到登录页面, 这个方法实际上会被触发多次
// 目前测试看，多次调用并不会产生问题...
function loginExpired() {
  wx.reLaunch({
    url: '/pages/login/login?man=true',
  })
  wx.showToast({
    title: '会话过期', icon: 'none'
  })
  // 删除旧的 token
  try {
    wx.removeStorageSync('token')
  } catch (e) { }
}

/**
 * 判断请求状态是否成功
 * 参数：http状态码
 * 返回值：[Boolen]
 */
function isHttpSuccess(status) {
  return status >= 200 && status < 300 || status === 304;
}

// login
// if login success goto home, then register and login
// 自动授权
function autoAuth() {
  console.log("start auto auth..")
  return new Promise((res, rej) => {
    // check localstorage first
    const value = wx.getStorageSync('token')
    if (value && !util.jwtExpire(value)) {
      g.token = value
      res(value)
      return
    }

    console.log("try login..", value)

    // try to auth
    wx.login({
      success: function (resp) {
        if (resp.code) {
          console.log('get code:', resp.code)
          req({
            url: `${Host}/api/auth`,
            method: 'POST',
            data: {
              code: resp.code,
            }
          }).then((resp) => {
            // 返回一个本地的 Token
            console.log(resp)
            if (resp.statusCode == 200) {
              //success, save token
              g.token = resp.data.access_token
              console.log("get token", resp.data)
              res(g.token)
              wx.setStorage({
                key: 'token',
                data: g.token
              })
            } else {
              rej({ code: -1, err: 'fail:' + resp.statusCode})
            }
          }).catch((err) => {
            console.log(err)
            rej({ code: -1, err: err })
          })
        } else {
          rej({ code: -1, err: 'wx.login return nil code' })
        }
      },
      fail: function(err) {
        rej({ code: -1, err: err })
      },
    })
  })
}

// Promised method: User/Post/Comment
function auth() {
  wx.login({
    success: function(resp) {
      if (resp.code) {
        req({
          url: `${Host}/api/auth`,
          method: 'POST',
          data: {
            code: resp.code,
          }
        })
      }
    }
  })
}

// mata-data

function getMetaData() {
  return req({
    url: `${Host}/api/metadata`,
    method: 'GET'
  })
}

// 签到API
function signin(date) {
  if (!date) {
    date = ''
  }
  return req({
    url: `${Host}/api/signs?date=${date}`,
    method: 'POST',
  })
}

function getSignToday() {
  return req({
    url: `${Host}/api/signs/today`,
    method: 'GET'
  })
}

function getSignList() {
  return req({
    url: `${Host}/api/signs`,
    method: 'GET'
  })
}

function getSignUserList(page, size) {
  return req({
    url: `${Host}/api/signs/users?page=${page}&size=${size}`,
    method: 'GET'
  })
}

// update user profile
function updateUser(data) {
  return req({
    url: `${Host}/api/users`,
    method: 'PUT',
    data: data,
  })
}

// return self user-info
function self() {
  return req({
    url: `${Host}/api/users/self`,
    method: 'GET'
  })
}

function getUserPostList(uid, since, limit) {
  return req({
    url: `${Host}/api/users/${uid}/posts?since_id=${since}&limit=${limit}`,
    method: 'GET'
  })
}

function getUserCommentList(uid, since, limit) {
  return req({
    url: `${Host}/api/users/${uid}/comments?since_id=${since}&limit=${limit}`,
    method: 'GET'
  })
}

function getUserFavorList(uid, since, limit) {
  return req({
    url: `${Host}/api/users/${uid}/favors?since_id=${since}&limit=${limit}`,
    method: 'GET'
  })
}


// get post list, fitler: top,val,adz, topic
function getPostList(since, limit, filter, topic) {
  if (!topic) {
    return req({
      url: `${Host}/api/posts?since_id=${since}&limit=${limit}&filter=${filter}`,
      method: 'GET'
    })
  } else {
    var encoded = encodeURIComponent(topic)
    return req({
      url: `${Host}/api/tags/${encoded}/posts?since_id=${since}&limit=${limit}`,
      method: 'GET'
    })
  }
}

function getPost(id) {
  return req({
    url: `${Host}/api/posts/${id}`,
    method: 'GET'
  })
}

// create post
function createPost(data) {
  return req({
    url: `${Host}/api/posts`,
    method: 'POST',
    data: data,
  })
}

// update post
function updatePost(id, data) {
  return req({
    url: `${Host}/api/posts/${id}`,
    method: 'PUT',
    data: data
  })
}

// delete post
function deletePost(id) {
  return req({
    url: `${Host}/api/posts/${id}`,
    method: 'DELETE'
  })
}

// get comment list
function getCommentList(pid, since, limit) {
  return req({
    url: `${Host}/api/posts/${pid}/comments`,
    method: 'GET'
  })
}

function getComment(id) {
  return req({
    url: `${Host}/api/posts/comments/${id}`,
    method: 'GET'
  })
}

function createComment(data) {
  return req({
    url: `${Host}/api/posts/comments`,
    method: 'POST',
    data: data,
  })
}

function updateComment(id, data) {
  return req({
    url: `${Host}/api/posts/comments/${id}`,
    method: 'PUT'
  })
}

function deleteComment(id) {
  return req({
    url: `${Host}/api/posts/comments/${id}`,
    method: 'DELETE'
  })
}

// favors
function getPostFavorList(pid, since, limit) {
  return req({
    url: `${Host}/api/posts/${pid}/favors?since_id=${since}&limit=${limit}`,
    method: 'GET'
  })
}

function getPostFavorCount(pid) {
  return req({
    url: `${Host}/api/posts/${pid}/favors/count`,
    method: 'GET'
  })
}

function createPostFavor(pid) {
  return req({
    url: `${Host}/api/posts/favors`,
    method: 'POST',
    data: {pid: pid}
  })
}

function deletePostFavor(pid) {
  return req({
    url: `${Host}/api/posts/${pid}/favors`,
    method: 'DELETE'
  })
}

// comment favors
function getCommentFavorList(cid, since, limit) {
  return req({
    url: `${Host}/api/comments/${cid}/favors?since_id=${since}&limit=${limit}`,
    method: 'GET'
  })
}

function getCommentFavorCount(cid) {
  return req({
    url: `${Host}/api/comments/${cid}/favors/count`,
    method: 'GET'
  })
}

function createCommentFavor(cid) {
  return req({
    url: `${Host}/api/comments/favors`,
    method: 'POST',
    data: {cid: cid} 
  })
}

function deleteCommentFavor(cid) {
  return req({
    url: `${Host}/api/comments/${cid}/favors`,
    method: 'DELETE'
  })
}

// tags
function getPostByTag(tag) {
  var encoded = encodeURIComponent(tag)
  return req({
    url: `${Host}/api/tags/${encoded}/posts`,
    method: 'GET'
  })
}

function getTagList() {
  return req({
    url: `${Host}/api/tags`,
    method: 'GET'
  })
}

function linkTagPost(data) {
  return req({
    url: `${Host}/api/tags/posts`,
    method: 'POST',
    data: data,
  })
}

// message
function getMessageList(q, since, limit) {
  return req({
    url: `${Host}/api/messages?q=${q}&since_id=${since}&limit=${limit}`,
    method: 'GET'
  })
}

function getMessageCount() {
  return req({
    url: `${Host}/api/messages/count`,
    method: 'GET'
  })
}

function setMessageRead(id) {
  return req({
    url: `${Host}/api/messages/${id}/read`,
    method: 'PUT'
  })
}

function setAllMessageRead() {
  return req({
    url: `${Host}/api/messages/read`,
    method: 'PUT'
  })
}

// 私信接口
function getChatUserList() {
  return req({
    url: `${Host}/api/chat/users`,
    method: 'GET'
  })
}

function getChatListFrom(uid, since, limit) {
  if (!since) {
    since = ''  
  }
  if (!limit) {
    limit = ''
  }
  return req({
    url: `${Host}/api/chat/messages?from=${uid}&since_id=${since}&limit=${limit}`,
    method: 'GET'
  })
}

function createChatMessage(data) {
  return req({
    url: `${Host}/api/chat/messages`,
    method: 'POST',
    data: data,
  })
}

function setChatMessageReadFrom(uid) {
  return req({
    url: `${Host}/api/chat/messages/read?from=${uid}`,
    method: 'PUT'
  })
}

// 经验等级
function getGradeList() {
  return req({
    url: `${Host}/api/exp/grades`,
    method: 'GET'
  })
}

function getExpKindList() {
  return req({
    url: `${Host}/api/exp/types`,
    method: 'GET'
  })
}

function getUserListExp(page, size) {
  return req({
    url: `${Host}/api/exp/users?page=${page}&size=${size}`,
    method: 'GET'
  })
}

// 举报接口
function createReport(data) {
  return req({
    url: `${Host}/api/reports`,
    method: 'POST',
    data: data,
  })
}

// 解密接口
function decrypt(data) {
  return req({
    url: `${Host}/api/actions/decrypt`,
    method: 'POST',
    data: data,
  })
}

module.exports = {
  autoAuth: autoAuth,
  updateUser: updateUser,
  getSelf: self,
  getUserPostList: getUserPostList,
  getUserCommentList: getUserCommentList,
  getUserFavorList: getUserFavorList,

  // meta
  getMetaData: getMetaData,

  // post
  getPostList: getPostList,
  getPost: getPost,
  createPost: createPost,
  deletePost: deletePost,


  // comment
  getCommentList: getCommentList,
  getComment: getComment,
  createComment: createComment,
  updateComment: updateComment,
  deleteComment: deleteComment,

  // favors
  getPostFavorList: getPostFavorList,
  getPostFavorCount: getPostFavorCount,
  createPostFavor: createPostFavor,
  deletePostFavor: deletePostFavor,

  getCommentList: getCommentList,
  getCommentFavorCount: getCommentFavorCount,
  createCommentFavor: createCommentFavor,
  deleteCommentFavor: deleteCommentFavor,

  // tags
  getPostByTag: getPostByTag,
  getTagList: getTagList,
  linkTagPost: linkTagPost,

  // messages
  getMessageList: getMessageList,
  getMessageCount: getMessageCount,
  setMessageRead: setMessageRead,
  setAllMessageRead: setAllMessageRead,

  // chat
  getChatUserList: getChatUserList,
  getChatMsgListFrom: getChatListFrom,
  createChatMessage: createChatMessage,
  setChatMessageRead: setChatMessageReadFrom,

  // reports
  createReport: createReport,

  // signin
  signin: signin,
  getSignToday: getSignToday,
  getSignList: getSignList,
  getSignUserList: getSignUserList,

  // exp
  getGradeList: getGradeList,
  getExpKindList: getExpKindList,
  getUserListExp: getUserListExp,
  
  // actions
  decrypt: decrypt,
}
