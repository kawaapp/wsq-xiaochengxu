import api from '../../../utils/api.js'
import util from '../../../utils/util.js'
import biz from '../../../utils/biz.js'

var view = undefined
function setup(v) {
  view = v
}
function onUnload() {
  view = undefined
}

function onLoad(options) {
  var req = util.getRequest("user")
  var user = req.data
  user.days = util.getDaysFromNow(user.created_at)
  view.setData({ user: user })
}

function onPullDownRefresh() {

}

function onReachBottom() {

}

function onClickSend() {
  if (!biz.isUserHasName('')) {
    return
  }
  var user = this.data.user
  util.sendRequest('user', user)
  wx.navigateTo({
    url: '/pages/chat/chat?uid=' + user.id,
  })
}

function onClickItem(e) {

}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  onClickItem: onClickItem,
  onClickSend: onClickSend,
}