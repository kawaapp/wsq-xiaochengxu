const api = require('../../../utils/api.js')

Page({

  // 页面的初始数据
  data: {
    orders: [],
    show: false,
    item: {},
  },

  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    setup(this)
  },

  clickItem : function(e) {
    const item = e.currentTarget.dataset.item
    this.setData({ show: true, item: item})
  },

  clickClose: function(e) {
    this.setData({ show: false, item: {}})
  }
})

function setup(view) {
  api.getPointOrderList().then( resp => {
    view.setData({ orders: massage(resp.data)})
    console.log("get orders:", resp)
  }).catch( err => {
    console.log("get order err:", err)
  })
}

function massage(items) {
  return items.map( item => {
    try {
      const hash = JSON.parse(item.snapshot)
      item.user = hash.user
      item.item = hash.item
    } catch (e) {
      item.user = {}
      item.item = {}
    }
    return item
  })
}