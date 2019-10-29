const api = require('../../../../utils/api.js')
const util = require('../../../../utils/util.js')
const biz = require('../../../../utils/biz.js')

const app = getApp()
const PAGE_SIZE = 20

var view = undefined

// Home Controller 
function setup(_view) {
  view = _view
}

function onUnload() {
  view = undefined
}

// First Load
function onLoad(opt) {
  fetchUserList()
}

function onPullDownRefresh() {
  fetchUserList()
}

function onReachBottom() {
  var loader = view.data.loader
  if (loader.ing || !loader.more) {
    return
  }

  var page = view.data.page + 1
  view.setData({page: page})
  view.setData({ loader: {
    ing: true,
    more: loader.more,
  }})

  var users = view.data.users

  api.getUserList("active", page, PAGE_SIZE).then(resp => {
    var loader = {
      ing: false,
      more: resp.data && resp.data === PAGE_SIZE
    }
    view.setData({ loader: loader })
    view.setData({ users: users.concat(resp.data)})
  }).catch(err => {
    console.log(err)
    view.setData({
      loader: { ing: false, more: view.data.loader.more }
    })
  })
}

function fetchUserList() {
  if (view.data.loader.ing) {
    return
  }

  view.setData({
    loader: { ing: true, more: view.data.loader.more}
  })

  api.getUserList("active", 1, PAGE_SIZE).then(resp => {
    var loader = {
      ing: false,
      more: resp.data && resp.data === PAGE_SIZE
    }
    view.setData({ loader: loader })
    view.setData({ users: resp.data })
  }).catch(err => {
    console.log(err)
    view.setData({
      loader: { ing: false, more: view.data.loader.more }
    })
  })
}

function fetchMoreUser(view) {

}

function onClickItem(e) {
  var idx = e.currentTarget.dataset.idx
  var user = view.data.users[idx]

  util.sendRequest("user", user)
  wx.navigateTo({
    url: '/pages/user/user',
  })
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
}

