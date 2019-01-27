// ALL server-side API
const Host = "http://127.0.0.1:1323"
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
        res(r);
      },
      fail(err) {
        rej(err);
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
    if (value) {
      g.token = value
      res(value)
      return
    }

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

function login(name, pw) {
  return req({
    url: `${Host}/login`,
    method: 'POST',
    data:{name: name, password:pw}
  })
}

function register(name, pw) {
  return req({
    url: `${Host}/register`,
    method: 'POST',
    data: { name: name, password: pw }
  })
}

// get topic list
function getTopicList(page) {
  return req({
    url: `${Host}/api/posts`,
    method: 'GET'
  })
}

// create topic
function createTopic(data) {
  return req({
    url: `${Host}/api/posts`,
    method: 'POST',
    data: data,
  })
}

// update topic
function updateTopic(id, data) {
  return req({
    url: `${Host}/api/posts/${id}`,
    method: 'PUT',
    data: data
  })
}

// delete topic
function deleteTopic(id) {
  return req({
    url: `${Host}/api/posts/${id}`,
    method: 'DELETE'
  })
}

// get comment list
function getCommentList(pid) {
  return req({
    url: `${Host}/api/posts/${pid}/comments/`,
    method: 'GET'
  })
}

function createComment(data) {
  return req({
    url: `${Host}/api/posts/comments`,
    method: 'POST'
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

module.exports = {
  autoAuth: autoAuth,

  // topic
  getTopicList: getTopicList,
  createTopic: createTopic,
  updateTopic: updateTopic,
  deleteTopic: deleteTopic,
  // comment
  getCommentList: getCommentList,
  createComment: createComment,
  updateComment: updateComment,
  deleteComment: deleteComment,
}