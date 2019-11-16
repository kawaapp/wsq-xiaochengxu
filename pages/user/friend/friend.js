const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
const app = getApp()
const PAGE_SIZE = 20

// pages/user/friend/friend.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabItems: ["关注", "关注我的"],
    tabCurrent: 0,
    followers: [],
    followings: [],
    pageNumber: 1,
    pageSize: 20,
    loading: false,
    hasmore: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    fetchFollowingList(this)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.firstLoad()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const { tabCurrent } = this.data
    if (tabCurrent == 0) {
      fetchMoreFollowing(this)
    } else {
      fetchMoreFollower(this)
    }
  },

  onTabChanged: function(e) {
    this.setData({ tabCurrent: e.detail }, () => {
      this.firstLoad()
    })
  },

  firstLoad: function(e) {
    const { tabCurrent } = this.data
    if (tabCurrent == 0) {
      fetchFollowingList(this)
    } else {
      fetchFollowerList(this)
    }
  },

  clickUnfollow: function(e) {
    var idx = e.currentTarget.dataset.idx
    var user = this.data.followings[idx]
    var view = this
    // do cancel
    var cancel = function() {
      api.unfollow(user.id).then( resp => {
        wx.showToast({
          title: '取消成功',
        })
        view.data.followings.splice(idx, 1)
        view.setData({ followings: view.data.followings})
      }).catch( err => {
        console.log(err)
        wx.showToast({
          title: '取消失败:'+err.code, icon: 'none'
        })
      })
    }

    // show warning 
    wx.showModal({
      title: '提示',
      content: `确认要取消关注: ${user.nickname} 吗？`,
      success(res) {
        if (res.confirm) {
          cancel()
        }
      }
    })
  }, 

  clickFollow: function(e) {
    var idx = e.currentTarget.dataset.idx
    var user = this.data.followers[idx]
    api.follow(user.id).then( resp => {
      wx.showToast({
        title: '关注成功',
      })
    }).catch( err => {
      console.log(err)
      wx.showToast({
        title: '关注失败:' + err.code, icon: 'none'
      })
    })
  },

  clickItem: function(e) {
    var idx = e.currentTarget.dataset.idx
    var user = [this.data.followings, this.data.followers][this.data.tabCurrent][idx]
    util.sendRequest('user', {
      idx: idx,
      data: user
    })
    wx.navigateTo({
      url: '/pages/user/user/user',
    })
  }
})

function fetchFollowerList(view) {
  view.setData({ pageNumber: 1})
  view.setData({ loading: true, hasmore: true})
  api.getFollowerList(0, 1, PAGE_SIZE).then( resp => {
    console.log("get follower..", resp)
    var hasmore = resp.data && resp.data === PAGE_SIZE
    view.setData({ loading: false, hasmore: hasmore })
    view.setData({ followers: resp.data })
  }).catch( err => {
    console.log(err)
    view.setData({ loading: true })
  })
}

function fetchMoreFollower(view) {
  const page = view.data.pageNumber + 1
  view.setData({ loading: true })
  api.getFollowerList(0, page, PAGE_SIZE).then( resp => {
    var hasmore = resp.data && resp.data === PAGE_SIZE
    view.setData({ loading: false, hasmore: hasmore, pageNumber: page })
    view.setData({ followers: view.data.followers.concat(resp.data)})
  }).catch( err => {
    console.log(err)
    view.setData({ loading: false })
  })
}

function fetchFollowingList(view) {
  view.setData({ pageNumber: 1 })
  view.setData({ loading: true, hasmore: true })
  api.getFollowingList(0, 1, PAGE_SIZE).then( resp => {
    var hasmore = resp.data && resp.data === PAGE_SIZE
    view.setData({ loading: false, hasmore: hasmore })
    view.setData({ followings: resp.data})
  }).catch( err => {
    console.log(err)
    view.setData({ loading: false })
  })
}

function fetchMoreFollowing(view) {
  const page = view.data.pageNumber + 1
  view.setData({ loading: true })
  api.getFollowingList(0, page, PAGE_SIZE).then(resp => {
    var hasmore = resp.data && resp.data === PAGE_SIZE
    view.setData({ loading: false, hasmore: hasmore, pageNumber: page })
    view.setData({ followings: view.data.followings.concat(resp.data)})
  }).catch( err => {
    console.log(err)
    view.setData({ loading: false })
  })
}