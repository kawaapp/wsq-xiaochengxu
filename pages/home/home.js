//logs.js
const ctr = require('./controller.js')
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

// topics:[
// {
//   author: {
//     name: '小虾米',
//     avatar: '',
//     ts: 1548571746979,
//   },
//   stats: {
//     favored: 0,
//     favors: 1,
//     comment: 1
//   },
//   text: '小虾米 啦啦啦',
//   styledText: ['123', '#hashtag#', 'abc']
//   imgs: [],
// },....]
Page({
  data: {
    posts: [],
    loader: {
      ing: false, // 是否正在加载
      more: true, // 是否有更多数据
    },
    menu: {
      show: false,
    },
    meta: {
      app_cover: "https://www.incimages.com/uploaded_files/image/970x450/getty_509107562_2000133320009280346_351827.jpg",
      app_logo: "https://placeit-assets.s3-accelerate.amazonaws.com/landing-pages/twitch-logo-maker-3/gaming-channel-custom-logo-maker-with-girly-avatar-1323h-768x768.png",
      app_name: "卡哇微社区",
      pv: "",
      users: ""
    },
    tab: {
      current: 0, //预设默认选中的栏目
      scrollLeft: 0, //tab滚动条距离左侧距离
      items: ["全部", "精华"],
    },
  },
  clickTab: function(e) {
    var idx = e.target.dataset.idx;
    var tab = this.data.tab
    if (tab.current != idx) {
      tab.current = idx
      this.setData({ tab: tab })
      ctr.onTabChanged(idx)
    }
  },
  onLoad: function (opt) {
    ctr.setup(this)
    ctr.onLoad(opt)
  },
  // 从其它页面返回数据
  onResult: function(data) {
    ctr.onResult(data)
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    ctr.onPullDownRefresh()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    ctr.onReachBottom()
  },

  // 发新贴
  newTopic: function(e) {
    wx.navigateTo({
      url: '/pages/writer/writer',
    })
  },

  // 点击帖子
  topicClick: function(e) {
    var idx = e.currentTarget.dataset.idx
    var post = this.data.posts[idx]
    util.sendRequest('post', {
      idx: idx,
      post: post
    })
    wx.navigateTo({
      url: '/pages/thread/thread',
    })
  },

  // 点击评论
  commentClick: function(e) {
    var idx = e.currentTarget.dataset.idx
    var post = this.data.posts[idx]
    util.sendRequest('post', {
      idx: idx,
      post: post
    })
    wx.navigateTo({
      url: '/pages/thread/thread',
    })
  },

  // 点击点赞
  favorClick: function(e) {
    ctr.onClickFavor(e)
  },

  // 点击菜单
  clickMenu: function(e) {
    ctr.onClickMenu(e)
  },
})
