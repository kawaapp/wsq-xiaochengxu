//logs.js
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const app  = getApp()

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
      // hero_image: "https://pic2.zhimg.com/v2-59e5f19045f4246de807bf351c3f07ae_r.jpg",
      // logo:"https://cdn.pixabay.com/photo/2017/07/10/19/42/logo-2491236_960_720.png",
      // title:"卡哇轻社区",
      // pv: "30W",
      // users: "3.6W"
    },
  },
  onLoad: function () {
    // 加载社区信息
    api.getMetaData().then( resp => {
      this.setData({
        meta: resp.data
      })
      console.log("get meta:", resp.data)
    })

    // 进入第一次加载
    api.getTopicList().then( resp => {
      this.setData({
        posts: decoratePosts(resp.data)
      })
    }).catch(err => {
      console.log("topic", err)
    })
  },
  // 从其它页面返回数据
  onResult: function(data) {
    if (data && data.ok) {
      if (data.req == 'newpost') {
        // data.post
        // 新增帖子到列表头部
        var post = data.data
        post.styled = util.decorateText(post.content)
        this.data.posts.unshift(post)
        this.setData({
          posts: this.data.posts
        })
      } else if (data.req == 'newcomment') {
        // 刷新评论数量
        var item = this.data.posts[data.idx]
        var key = 'posts[' + data.idx + '].stats'
        if (!item.stats) {
          item.stats = {}
        }
        if (item.stats.comments) {
          item.stats.comments += 1
        } else {
          item.stats.comments = 1
        }
        this.setData({ [key]: item.stats })
      }
    }
    console.log('home, on result data:' + data)
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
      api.getTopicList().then((resp) => {
        wx.stopPullDownRefresh()
        this.setData({
          posts: decoratePosts(resp.data)
        })
        console.log(resp.data[0])
      }).catch((err) => {
        wx.stopPullDownRefresh()
        console.log(err)
      })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.loader.ing || !this.data.loader.more) {
      return
    }

    var posts = this.data.posts
    var sinceId = 0
    var limit = 20
    if (posts && posts.length > 0) {
      sinceId = posts[posts.length-1].id
    }
    api.getTopicList(sinceId, limit).then((resp) => {
      this.data.loader.ing = false
      if (resp.data) {
        if(resp.data.length < 20) {
          console.log("no more data..." + sinceId)
          this.data.loader.more = false
        } 
        var styled = decoratePosts(resp.data)
        this.setData({
          posts: posts.concat(styled)
        })
      }
    }).catch((err) => {
      this.data.loader.ing = false
    })
  },

  newTopic: function(e) {
    wx.navigateTo({
      url: '/pages/writer/writer',
    })
  },
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
  favorClick: function(e) {
    var idx = e.currentTarget.dataset.idx
    var item = this.data.posts[idx]
    var key = 'posts[' + idx + '].stats'

    if (!item.stats) {
      item.stats = { favored: false, favors: 0, comments: 0 }
    }

    if (item.stats.favored && item.stats.favored > 0) {
      console.log("delete favor")
      api.deletePostFavor(item.id).then( resp => {
        item.stats.favored = false,
        item.stats.favors -= 1
        this.setData({[key]: item.stats})
        console.log("delete favor:", resp.statusCode)
      })
    } else {
      console.log("create favor")
      api.createPostFavor(item.id).then((resp) => {
        item.stats.favors += 1
        item.stats.favored = true
        this.setData({[key]: item.stats })
        console.log("favor fail:", resp.statusCode)
      }).catch(err => {
        console.log("favor err:", err)
      })
    }
  },
  clickMenu: function(e) {
    var idx = e.currentTarget.dataset.idx
    var item = this.data.posts[idx]
    var menu = {
      items: ["不感兴趣"],
      actions: [function(){}],
    }
    var user = app.globalData.userInfo
    var _this = this
    if (user && user.id == item.author.id) {
      menu.items.push("删除")
      menu.actions.push(function() {
        deletePost(_this, idx)
      })
    }

    wx.showActionSheet({
      itemList: menu.items,
      success: function (res) {
        console.log(JSON.stringify(res))
        console.log(res.tapIndex) // 用户点击的按钮，从上到下的顺序，从0开始
        var fn = menu.actions[res.tapIndex]
        fn()
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
})


function decoratePosts(posts) {
  for (var i = 0; i < posts.length; i++) {
    posts[i].styled = util.decorateText(posts[i].content)
    var utc = new Date(posts[i].created_at * 1000)
    posts[i].time = util.formatTime(utc)
  }
  return posts
}

function deletePost(p, idx) {
  var posts = p.data.posts
  var post  = posts[idx]
  api.deletePost(post.id).then( resp => {
    posts.splice(idx, 1)
    p.setData({ posts: posts })
    console.log("删除成功")
  }).catch( err => {
    console.log("删除失败")
  })
}