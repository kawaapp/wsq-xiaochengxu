const ctr = require('./controller.js')

// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    query:"",
    page: 1,
    posts: [],
    loading: false,
    hasmore: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    ctr.setup(this)
    ctr.onLoad(options)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    ctr.onReachBottom()
  },

  clickCancel: function(e) {
    ctr.onClickCancel(e)
  },

  bindInput: function(e) {
    this.setData({ query: e.detail.value })
  },

  clickSubmit: function(e) {
    ctr.onClickSearch(e)
  },

  clickItem: function(e) {
    ctr.onClickItem(e)
  }
})