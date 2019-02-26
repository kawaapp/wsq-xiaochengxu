const util = require('util.js')

// ALL server-side API
const Host = "http://127.0.0.1:1323"
//const Host = "https://siftapi.com"
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
    'Authorization': `Bearer ${g.token}`
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
          autoAuth()
        } else {
          rej({ 
            code: r.statusCode, 
            err: resp.data
          })
        }
      },
      fail(err) {
        rej({
          code: -1,
          err: err
        });
      },
      complete
    });
  });
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
      console.log("use cached token:" + value)
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
            url: `${Host}/auth`,
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

// Promised method: User/Topic/Comment
function auth() {
  wx.login({
    success: function(resp) {
      if (resp.code) {
        req({
          url: `${Host}/auth`,
          method: 'POST',
          data: {
            code: resp.code,
          }
        })
      }
    }
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


// get topic list
function getPostList(since, limit) {
  return req({
    url: `${Host}/api/posts?since_id=${since}&limit=${limit}`,
    method: 'GET'
  })
}

// create topic
function createPost(data) {
  return req({
    url: `${Host}/api/posts`,
    method: 'POST',
    data: data,
  })
}

// update topic
function updatePost(id, data) {
  return req({
    url: `${Host}/api/posts/${id}`,
    method: 'PUT',
    data: data
  })
}

// delete topic
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
    method: 'POST'
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
  return req({
    url: `${Host}/api/tags/${tag}/posts`,
    method: 'GET'
  })
}

function getTagList() {
  return req({
    url: `${Host}/api/tags`,
    method: 'GET'
  })
}

function createTag(tag) {
  return req({
    url: `${Host}/api/tags/posts`,
    method: 'POST'
  })
}

// message
function getMessageList(since, limit) {
  return req({
    url: `${Host}/api/messages?since_id=${since}&limit=${limit}`,
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


module.exports = {
  autoAuth: autoAuth,
  updateUser: updateUser,
  getSelf: self,
  getUserPostList: getUserPostList,
  getUserCommentList: getUserCommentList,
  getUserFavorList: getUserFavorList,

  // post
  getTopicList: getPostList,
  createTopic: createPost,
  updateTopic: updatePost,
  deleteTopic: deletePost,


  // comment
  getCommentList: getCommentList,
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
  createTag: createTag,

  // messages
  getMessageList: getMessageList,
  getMessageCount: getMessageCount,
  setMessageRead: setMessageRead,
  setAllMessageRead: setAllMessageRead
}