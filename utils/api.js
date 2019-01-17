// ALL server-side API
const Host = "http://localhost/"
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
    'Authorization: Bearer': g.token
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
// TODO: 感觉微信登录不是这么做的，
function autoLogin(name, pw) {
  return new Promise((res, rej) => {
    // check localstorage first
    const value = wx.getStorageSync('token')
    if (value) {
      g.token = value
      res(value)
      return
    } 

    // then try to login
    login(name, pw).then((resp)=>{
      if (resp.rcode == 200) {
        //success, save token
        g.token = resp.token
        console.log("get token", resp.data)
        res(g.token)
        wx.setStorage({
          key: 'token',
          data: g.token
        })
      } else {
        // register
        // register(name, password)
        rej({})
      }
    }).catch(()=> {
      rej({})
    })
  })
}

// Promised method: User/Topic/Comment
function login(name, pw) {
  return req({
    url: `${Host}/api/login`,
    method: 'POST'
  })
}

function register(name, pw) {
  return req({
    url: `${Host}/api/register`,
    method: 'POST'
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
    url: '/api/posts/${pid}/comments/',
    method: 'GET'
  })
}

function createComment(data) {
  return req({
    url: '/api/posts/comments',
    method: 'POST'
  })
}

function updateComment(id, data) {
  return req({
    url: '/api/posts/comments/${id}',
    method: 'PUT'
  })
}

function deleteComment(id) {
  return req({
    url: '/api/posts/comments/${id}',
    method: 'DELETE'
  })
}

module.exports = {
  autoLogin: autoLogin,
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