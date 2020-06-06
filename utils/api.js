const util = require('util.js')
const kawa = require('../kawa.js')

// ALL server-side API
//const Host = "http://127.0.0.1:1323"
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
    wx.removeStorageSync('kw.token')
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

// JSON 转 Query
function jsonQueryString(params) {
  if (!params) {
    return ""
  }
  return Object.keys(params).map(key => key + '=' + (params[key] !== undefined ? params[key] : '')).join('&');
}

// login
// if login success goto home, then register and login
// 自动授权
function autoAuth() {
  console.log("start auto auth..")
  return new Promise((res, rej) => {
    // check localstorage first
    const value = wx.getStorageSync('kw.token')
    if (value && !util.jwtExpire(value)) {
      g.token = value
      
      const app = getApp()
      if (app) {
        app.setToken(value)
      }
      
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
              const app = getApp()
              if (app) {
                app.setToken(g.token)
              }
              console.log("get token", resp.data)
              res(g.token)
              wx.setStorage({
                key: 'kw.token',
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

function getUserList(sort, page, size) {
  return req({
    url: `${Host}/api/users?sort=${sort}&page=${page}&size=${size}`,
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

function getUser(id) {
  return req({
    url: `${Host}/api/users/${id}`,
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

function getUserFavoriteList(uid, page, size) {
  return req({
    url: `${Host}/api/users/${uid}/favorites?page=${page}&size=${size}`,
    method: 'GET'
  })
}

// 关注关系
function follow(uid) {
  return req({
    url: `${Host}/api/users/followings`,
    method: 'POST',
    data: {user_id: uid}
  })
}

function unfollow(uid) {
  return req({
    url: `${Host}/api/users/followings/${uid}`,
    method: 'DELETE'
  })
}

function isFollowing(uid) {
  return req({
    url: `${Host}/api/users/followings/${uid || 0}`,
    method: 'GET'
  })
}

function getFollowingList(uid, page, size) {
  return req({
    url: `${Host}/api/users/${uid || 0}/followings?page=${page || 0}&size=${size || 20}`,
    method: 'GET'
  })
}

function getFollowerList(uid, page, size) {
  return req({
    url: `${Host}/api/users/${uid || 0}/followers?page=${page || 0}&size=${size || 20}`,
    method: 'GET'
  })
}

// get post list, fitler: top,val,adz, topic
function getPostList(params) {
  const q = encodeQuery(params)
  return req({
    url: `${Host}/api/posts?${q}`,
    method: 'GET',
  })
}

function encodeQuery(params) {
  return params? Object.keys(params)
          .sort()
          .map(key => {
              const val = params[key] !== undefined ? encodeURIComponent(params[key]): '';
              return key + "=" + val;
          })
          .join("&")
  : "";
}

function getPost(id) {
  return req({
    url: `${Host}/api/posts/${id}`,
    method: 'GET'
  })
}

function searchPost(params) {
  const q = encodeQuery(params)
  return req({
    url: `${Host}/api/posts/search?${q}`,
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

// set post status
function setPostStatus(id, data) {
  return req({
    url: `${Host}/api/posts/${id}/st?` + jsonQueryString(data),
    method: 'PUT',
  })
}

// 隐藏
function hidePost(id, v) {
  return setPostStatus(id, {'hid': v})
}
// 置顶
function pinPost(id, v) {
  return setPostStatus(id, {'top': v})
}
// 加精
function valPost(id, v) {
  return setPostStatus(id, { 'val': v })
}
// 审核
function auditPost(id) {
  return setPostStatus(id,{ 'aud': 1 })
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
    url: `${Host}/api/posts/${pid}/comments?since_id=${since || 0}&limit=${limit || 20}`,
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

function setAllMessageRead(which) {
  return req({
    url: `${Host}/api/messages/read?type=${which}`,
    method: 'PUT'
  })
}

// 私信接口
function getChatUserList(since, limit) {
  return req({
    url: `${Host}/api/chat/users?since_id=${since || 0}&limit=${limit || 20}`,
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

// 积分接口
function getPointKindList() {
  return req({
    url: `${Host}/api/point/types`,
    method: 'GET'
  })
}

function getPointItemList() {
  return req({
    url: `${Host}/api/point/items`,
    method: 'GET'
  })
}

function pointExchange(id) {
  return req({
    url: `${Host}/api/point/exchange`,
    method: 'POST',
    data: { item_id: id}
  })
}

function getPointOrderList() {
  return req({
    url: `${Host}/api/users/0/orders`,
    method: 'GET'
  })
}

// 收藏接口
function createFavorite(pid) {
  return req({
    url: `${Host}/api/posts/${pid}/favorites`,
    method: 'POST'
  })
}

function deleteFavorite(pid) {
  return req({
    url: `${Host}/api/posts/${pid}/favorites`,
    method: 'DELETE'
  })
}

// 活动接口
function getEnrollList(page, size) {
  return req({
    url: `${Host}/api/enrolls?page=${page || 1}&size=${size||20}`,
    method: 'GET'
  })
}

function getEnroll(id) {
  return req({
    url: `${Host}/api/enrolls/${id}`,
    method: 'GET'
  })
}

function getEnrollUserList(id, page, size) {
  return req({
    url: `${Host}/api/enrolls/${id}/users?page=${page || 1}&size=${size || 20}`,
    method: 'GET'
  })
}

function getEnrollUser(id) {
  return req({
    url: `${Host}/api/enrolls/${id}/users/0`,
    method: 'GET'
  })
}

function enrollJoin(data) {
  return req({
    url: `${Host}/api/enrolls/join`,
    method: 'POST',
    data: data,
  })
}

function enrollLeave(data) {
  return req({
    url: `${Host}/api/enrolls/leave`,
    method: 'POST',
    data: data,
  })
}

function enrollCheck(data) {
  return req({
    url: `${Host}/api/enrolls/check`,
    method: 'POST',
    data: data,
  })
}

// 问卷接口
function getFormList() {
  return req({
    url: `${Host}/api/forms`,
    method: 'GET'
  })
}

function getForm(id) {
  return req({
    url: `${Host}/api/forms/${id}`,
    method: 'GET'
  })
}

function getFormData(id) {
  return req({
    url: `${Host}/api/forms/${id}/data?uid=0`,
    method: 'GET'
  })
}

function formSubmit(data) {
  return req({
    url: `${Host}/api/forms/submit`,
    method: 'POST',
    data: data,
  })
}

// 获取最新的热点更新
function getHotList() {
  return req({
    url: `${Host}/api/hots`,
    method: 'GET'
  })
}

// 创建媒体
function createMedia(data) {
  return req({
    url: `${Host}/api/medias`,
    method: 'POST',
    data: data,
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

// 链接预览
function linkPreview(url) {
  return req({
    url: `${Host}/api/actions/link_preview`,
    method: 'POST',
    data: { url: url }
  })
}

// 生成二维码
function createQrCode() {
  return req({
    url: `${Host}/api/actions/create_qrcode`,
    method: 'POST'
  })
}

// 分享统计
function logShare(data) {
  return req({
    url: `${Host}/api/actions/share`,
    method: 'POST',
    data: data,
  })
}

// 获取自定义广告
function getAdunitList(t) {
  return req({
    url: `${Host}/api/adunits?p=mp&status=0&t=${t}`,
    method: 'GET'
  })
}

// 获取投票
function getPollList() {
  return req({
    url: `${Host}/api/polls?active=true`,
    method: 'GET'
  })
}

function getPoll(id) {
  return req({
    url: `${Host}/api/polls/${id}`,
    method: `GET`
  })
}

function createVote(data) {
  return req({
    url: `${Host}/api/polls/votes`,
    method: `POST`,
    data: data,
  })
}

// 申请加入
function createJoinRequest(data) {
  return req({
    url: `${Host}/api/joins/auth`,
    method: `POST`,
    data, data,
  })
}

function getJoinRequest(data) {
  return req({
    url: `${Host}/api/joins/auth`,
    method: 'GET',
    data: data,
  })
}

// 社区元信息
function getAppMeta() {
  return req({
    url: `${Host}/api/app/meta`,
    method: `GET`
  })
}

// 上传图片
function uploadFile(file) {
  return new Promise((res, rej) => {
    wx.uploadFile({
      url: 'https://kawaapp.com/x/api/images',
      filePath: file,
      name: 'file',
      success: function (resp) {
        if (resp.statusCode == 200) {
          res(resp.data)
        } else {
          rej({ code: resp.statusCode, msg: resp.data })
        }
      },
      fail: function (resp) {
        rej({ code: -1, msg: resp })
      }
    })
  })
}

// 获取文章
function getArticle(appKey, id) {
  const url = `https://wsq.kawaapp.com/api/articles/${id}`
  const header = { 'AppKey': appKey }
  const method = 'GET'
  return new Promise((res, rej) => {
    wx.request({ url, header, method,
      success(r) {
        if (r.statusCode == 200) {
          res(r);
        }
      },
      fail(err) {
        rej({ code: -1, err: err });
      },
    });
  });
}

// 消息订阅
function getTemplates() {
  return req({
    url: `${Host}/api/subs/templates`,
    method: `GET`,
  })
}

function getUserSubList() {
  return req({
    url: `${Host}/api/users/0/subs`,
    method: `GET`,
  })
}

function createUserSub(data) {
  return req({
    url: `${Host}/api/subs/batch`,
    method: "POST",
    data: data,
  })
}

function getSubState() {
  return req({
    url: `${Host}/api/subs/state`,
    method: "GET",
  })
}

module.exports = {
  autoAuth: autoAuth,
  updateUser: updateUser,
  getSelf: self,
  getUser: getUser,
  getUserList: getUserList,
  getUserPostList: getUserPostList,
  getUserCommentList: getUserCommentList,
  getUserFavorList: getUserFavorList,
  getUserFavoriteList: getUserFavoriteList,

  // follow
  isFollowing: isFollowing,
  follow: follow,
  unfollow: unfollow,
  getFollowingList: getFollowingList,
  getFollowerList: getFollowerList,

  // meta
  getMetaData: getMetaData,

  // post
  getPostList: getPostList,
  getPost: getPost,
  createPost: createPost,
  deletePost: deletePost,
  hidePost: hidePost,
  pinPost: pinPost,
  valPost: valPost,
  searchPost: searchPost,



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

  // point
  getPointKindList: getPointKindList,
  getPointItemList: getPointItemList,
  getPointOrderList: getPointOrderList,
  pointExchange: pointExchange,

  // favorite
  createFavorite: createFavorite,
  deleteFavorite: deleteFavorite,

  // media
  createMedia: createMedia,
  
  // actions
  decrypt: decrypt,
  linkPreview: linkPreview,
  createQrCode: createQrCode,
  logShare: logShare,

  // upload
  uploadFile: uploadFile,

  // article
  getArticle: getArticle,

  // ad-unit
  getAdunitList: getAdunitList,

  // poll
  getPollList: getPollList,
  getPoll: getPoll,
  createVote: createVote,

  // join
  createJoinRequest: createJoinRequest,
  getJoinRequest: getJoinRequest,
  getAppMeta: getAppMeta,

  // enroll
  getEnrollList: getEnrollList,
  getEnroll: getEnroll,
  getEnrollUserList: getEnrollUserList,
  getEnrollUser: getEnrollUser,

  enrollJoin: enrollJoin,
  enrollLeave: enrollLeave,
  enrollCheck: enrollCheck,

  // forms
  getFormList: getFormList,
  getForm: getForm,
  getFormData: getFormData,
  formSubmit: formSubmit,

  // hots
  getHotList: getHotList,

  // 订阅
  getTemplates: getTemplates,
  getUserSubList: getUserSubList,
  createUserSub: createUserSub,
  getSubState: getSubState,
}
