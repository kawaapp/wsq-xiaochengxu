const api = require('api.js')
const app = getApp()

// 创建菜单: 举报，删除，收藏，(Admin: 置顶，加精，隐藏，审核)
function create(item, delCallback) {
  var user = app.globalData.userInfo
  var isAdmin = user && user.admin
  var menu = {
    items: [],
    actions: [],
  }
  
  // 举报
  menu.items.push("举报")
  menu.actions.push(function () {
    report(item)
  })

  // 收藏
  if (item.stats && item.stats.favorite) {
    menu.items.push("取消收藏")
  } else {
    menu.items.push("收藏")
  }
  menu.actions.push(function () {
    favorite(item)
  })

  // 权限菜单：仅 Admin 可见
  if (isAdmin) {
    if ((item.status >> 0) & 1) {
      menu.items.push("取消置顶")
    } else {
      menu.items.push("置顶")
    }
    menu.actions.push(function () {
      pinPost(item)
    })

    if ((item.status >> 1) & 1) {
      menu.items.push("取消加精")
    } else {
      menu.items.push("加精")
    }
    menu.actions.push(function () {
      valPost(item)
    })

    if ((item.status >> 2) & 1) {
      menu.items.push("取消隐藏")
    } else {
      menu.items.push("隐藏")
    }
    menu.actions.push(function () {
      hidePost(item)
    })
  }
  return menu
}

function report(post) {
  var digest = {
    text: post.content,
    images: post.images,
  }
  var data = {
    entity_id: post.id,
    entity_ty: 0,
    content: JSON.stringify(digest)
  }

  api.createReport(data).then(resp => {
    wx.showToast({
      title: '举报成功',
    })
  }).catch(err => {
    wx.showToast({
      title: '举报失败：网络错误', icon: 'none',
    })
  })
}

function favorite(item) {
  var result 
  if (item.stats.favorite) {
    result = api.deleteFavorite(item.id).then(resp => {
      item.stats.favorite = false
      wx.showToast({ title: '取消成功', icon: 'none' })
    })
  } else {
    result = api.createFavorite(item.id).then((resp) => {
      item.stats.favorite = true
      wx.showToast({ title: '收藏成功', icon: 'none' })
      console.log("favorite succ:", resp.statusCode)
    })
  }
  result.catch (err => {
    wx.showToast({ title: '操作失败', icon: 'none' })
  })
}

// 置顶
function pinPost(post) {
  var status = oppo_value(post.status, 0)
  api.pinPost(post.id, status).then(() => {
    post.status = bit_toggle(post.status, 0)
    wx.showToast({ title: '操作成功', icon: 'none' })
  }).catch(err => {
    wx.showToast({ title: '操作失败', icon: 'none' })
  })
}
// 加精
function valPost(post) {
  var status = oppo_value(post.status, 1)
  api.valPost(post.id, status).then(() => {
    post.status = bit_toggle(post.status, 1)
    wx.showToast({ title: '操作成功', icon: 'none' })
  }).catch(err => {
    wx.showToast({ title: '操作失败', icon: 'none' })
  })
}
// 隐藏
function hidePost(post) {
  var status = oppo_value(post.status, 2)
  api.hidePost(post.id, status).then(() => {
    post.status = bit_toggle(post.status, 2)
    wx.showToast({ title: '操作成功', icon: 'none' })
  }).catch(err => {
    wx.showToast({ title: '操作失败', icon: 'none' })
  })
}

// 审核通过
function auditPost(post) {
  api.auditPost(post.id).then(()=> {
    post.status = bit_clear(post.status, 3)
    wx.showToast({ title: '审核通过', icon: 'none' })
  }).catch(err => {
    wx.showToast({ title: '操作失败', icon: 'none' })
  })
}

function oppo_value(num, bit) {
  return 1 - ((num >> bit) & 1)
}

function bit_set(num, bit) {
  return num | 1 << bit;
}

function bit_clear(num, bit) {
  return num & ~(1 << bit);
}

function bit_test(num, bit) {
  return ((num >> bit) % 2 != 0)
}

function bit_toggle(num, bit) {
  return bit_test(num, bit) ? bit_clear(num, bit) : bit_set(num, bit);
}

module.exports = {
  create: create,
}