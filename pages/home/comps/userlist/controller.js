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
  var { loading, hasmore } = view.data
  if (loading || !hasmore) {
    return
  }

  var page = view.data.page + 1
  view.setData({ loading: true })
  var users = view.data.users

  api.getUserList("active", page, PAGE_SIZE).then(resp => {
    var hasmore = resp.data && resp.data.length === PAGE_SIZE
    view.setData({ page: page })
    view.setData({ loading: false, hasmore: hasmore})
    view.setData({ users: users.concat(massage(resp.data))})
  }).catch(err => {
    console.log(err)
    view.setData({loading: false})
  })
}

function fetchUserList() {
  if (view.data.loading) {
    return
  }

  view.setData({loading: true, hasmore: true, page: 1 })
  api.getUserList("active", 1, PAGE_SIZE).then(resp => {
    wx.stopPullDownRefresh()
    var hasmore = resp.data && resp.data.length === PAGE_SIZE
    view.setData({ loading: false, hasmore: hasmore })
    view.setData({ users: massage(resp.data) })
  }).catch(err => {
    wx.stopPullDownRefresh()
    console.log(err)
    view.setData({ loading: false })
    wx.showToast({
      title: '刷新失败', icon: 'none'
    })
  })
}

function fetchMoreUser(view) {

}

function onClickItem(e) {
  var idx = e.currentTarget.dataset.idx
  var user = view.data.users[idx]

  util.sendRequest('user', {
    idx: idx,
    data: user
  })
  wx.navigateTo({
    url: '/pages/user/user/user',
  })
}

function massage(users) {
  return users.map( user => {
    return biz.parseUser(user)
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

