const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

const PageSize = 20

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    users: [],
    page: 1,
    loading: false,
    hasmore: false,
  },

  /* 生命周期函数--监听页面加载 */
  onLoad: function (options) {
    firsLoad(this, options.id)
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
    var users = resp.data
    users.map( user => {
      user.joinTime = util.prettyTime(new Date(user.created_at*1000))
    })
    view.setData({ users: users, id: id, page: 1 })
  }).catch( err => {
    console.log("get enroll user:", err)
  })
}

function loadMore(view) {
  var { id, page, users = [] } = view.data
  view.setData({ loading: true })
  api.getEnrollUserList(id, page + 1, PageSize).then( resp => {
    var others = resp.data
    var hasmore = true
    if (others) {
      others.map( user => {
        user.joinTime = util.prettyTime(new Date(user.created_at*1000))
      })
      hasmore = others.length == PageSize
    }
    users.concat(others)
    view.setData({ users, id: id, page: page+1, hasmore,  loading: false})
  }).catch( err => {
    view.setData({ loading: false})
    console.log("get enroll user:", err)
  })
}