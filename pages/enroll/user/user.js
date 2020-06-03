const api = require('../../../utils/api.js')
const PageSize = 20

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    users: [],
    page: 1,
  },

  /* 生命周期函数--监听页面加载 */
  onLoad: function (options) {
    firsLoad(this, options)
  },


  /* 页面相关事件处理函数--监听用户下拉动作 */
  onPullDownRefresh: function () {
    firsLoad(this, this.data.id)
  },

  /* 页面上拉触底事件的处理函数 */
  onReachBottom: function () {
    loadMore(this)
  },
})

function firsLoad(view, id) {
  api.getEnrollUserList(id, 1, PageSize).then( resp => {
    view.setData({ users: resp.data, id: id, page: 1 })
  }).catch( err => {
    console.log("get enroll user:", err)
  })
}

function loadMore(view) {
  var { page } = this.data
  api.getEnrollUserList(id, page + 1, PageSize).then( resp => {
    view.setData({ users: resp.data, id: id, page: page+1 })
  }).catch( err => {
    console.log("get enroll user:", err)
  })
}