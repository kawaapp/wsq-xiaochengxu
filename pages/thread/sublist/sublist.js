import api from '../../../utils/api.js'

const app = getApp()

Component({
  /* 组件的属性列表 */
  properties: {
    comments: {
      type: Array,
      value: []
    },
    parent: {
      type: Object,
      value: {}
    }
  },

  /* 组件的初始数据 */
  data: {

  },

  /* 组件的方法列表 */
  methods: {
    clickItem: function(e) {
      showActionSheet(this, e.currentTarget.dataset.idx)
    }
  }
})

function showActionSheet(view, idx) {
  var { comments } = view.data
  var item = comments[idx]
  var menu = {
    items: [], actions: []
  }
  // 回复菜单
  menu.items.push("回复")
  menu.actions.push( () => {
    if (!item.author) {
      wx.showToast({ title: '用户不存在！', icon: "none" })
      return
    }
    showInputDialog({
      hint: item.author.nickname,
      success: (value) => {
        replyToComment(view, idx, value)
      }
    })
  })
  
  // 删除菜单
  var user = app.globalData.userInfo
  if (user && user.id == item.author_id) {
    menu.items.push("删除")
    menu.actions.push( () => {
      deleteComment(view, idx)
    })
  }

  // 拉起菜单
  wx.showActionSheet({
    itemList: menu.items,
    success: function (res) {
      var fn = menu.actions[res.tapIndex]
      if (fn) { fn() }
    },
    fail: function (res) {
      console.log(res.errMsg)
    }
  })
}

function replyToComment(view, idx, value) {
  var { comments, parent } = view.data
  var item = comments[idx]
  // send data 
  var data = {
    post_id: item.post_id,
    parent_id: parent.id,
    reply_id: item.author.id,
    content: '\r' + value.text,
  }

  // send
  api.createComment(data).then(resp => {
    if (resp.data) {
      resp.data.reply = true
      resp.data.replier = item.author
    }
    comments.push(resp.data)
    view.setData({ comments })
    wx.showToast({
      title: '已发送', icon: 'success'
    })
  }).catch(err => {
    wx.showToast({
      title: '发送失败:'+err.code, icon: 'none'
    })
    console.log(err)
  })
}

function deleteComment(view, idx) {
  var { comments } = view.data
  var item = comments[idx]
  api.deleteComment(item.id).then( resp => {
    comments.splice(idx, 1)
    view.setData({ comments })
    wx.showToast({
      title: '删除成功', icon: 'none'
    })
  }).catch( err => {
    wx.showToast({
      title: '删除失败:'+err.code, icon: 'none'
    })
    console.log(err)
  })
}

function showInputDialog(params) {
    var pages = getCurrentPages()
    var page = pages[pages.length-1]
    if (page) {
      page.showInputDialog(params)
    }
}