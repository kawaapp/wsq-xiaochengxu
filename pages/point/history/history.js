const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

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
    item.user || (item.user = {})
    item.item || (item.item = {}) 
    const utcTime = new Date(item.created_at * 1000)
    item.date = util.prettyTimeYMD(utcTime)
    return item
  })
}