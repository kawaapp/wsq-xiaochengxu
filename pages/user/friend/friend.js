const api = require('../../../utils/api.js')
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    fetchFollowerList(this)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    const { tab } = this.data
    if (tab.current == 0) {
      fetchFollowerList(this)
    } else {
      fetchFollowingList(this)
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const { tab } = this.data
    if (tab.current == 0) {
      fetchMoreFollower(this)
    } else {
      fetchMoreFollowing(this)
    }
  },

  onTabChanged: function(e) {
    this.setData({ tabCurrent: e.detail })
  },

  clickUnfollow: function(e) {
    var idx = e.currentTarget.dataset.idx
    var user = view.data.followers[idx]
    api.unfollow(user.id).then( resp => {
      wx.showToast({
        title: '取消成功',
      })
      var data = view.data.followers.splice(idx, 1)
      view.setData({ followers: data})
    }).catch( err => {
      console.log(err)
      wx.showToast({
        title: '取消失败:'+err.code, icon: 'none'
      })
    })
  }, 

  clickFollow: function(e) {
    var idx = e.currentTarget.dataset.idx
    var user = view.data.followers[idx]
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
  }
})

function fetchFollowerList(view) {
  view.setData({ pageNumber: 1})
  api.getFollowerList(0, 1, PAGE_SIZE).then( resp => {
    console.log("get follower..", resp)
    view.setData({ followers: resp.data })
  }).catch( err => {
    console.log(err)
  })
}

function fetchMoreFollower(view) {
  const page = view.data.pageNumber + 1
  api.getFollowerList(0, page, PAGE_SIZE).then( resp => {
    view.setData({ followers: view.data.followers.concat(resp.data)})
  }).catch( err => {
    console.log(err)
  })
}

function fetchFollowingList(view) {
  view.setData({ pageNumber: 1 })
  api.getFollowingList(0, 1, PAGE_SIZE).then( resp => {
    view.setData({ following: resp.data})
  }).catch( err => {
    console.log(err)
  })
}

function fetchMoreFollowing(view) {
  const page = view.data.pageNumber + 1
  api.getFollowingList(0, page, PAGE_SIZE).then(resp => {
    view.setData({ following: view.data.followings.concat(resp.data)})
  }).catch( err => {
    console.log(err)
  })
}