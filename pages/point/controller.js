const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

const app = getApp()

var view = undefined
function setup(_view) {
  view = _view
}

function onLoad() {
  api.getPointKindList().then( resp => {
    view.setData({ kinds: resp.data })
  }).catch( err => {
    console.log("get pt-type err", err)
  })
  api.getPointItemList().then( resp => {
    view.setData({ items: resp.data })
  }).catch( err => {
    console.log("get pt-item err", err)
  })
  
  const user = app.globalData.userInfo
  if (user) {
    view.setData({ user: user })
  }

  // get latest point value
  api.getSelf().then((resp) => {
    if (resp.data) {
      app.globalData.userInfo.point_count = resp.data.point_count
      view.setData({ user: resp.data })
    }
  })
}

function onUnload() {
  view = undefined
}

function exchange(target) {
  api.pointExchange(target.item.id).then( resp => {
    view.setData({ show: false, target: {}})
    view.setData({ user: resp.data.user || {}})
    wx.showToast({ title: '兑换成功！' })
  }).catch( err => {
    console.log(err)
    wx.showToast({ title: mapErr(err, target.item), icon: 'none'})
  })
}

function mapErr(err, item) {
  if (err.code == 403) {
    if (err.err === "points:not enough points") {
      return "兑换失败，积分不够！"
    } else if (err.err == "points:not enough items") {
      return "兑换失败, 商品售罄！"
    } else if (err.err == "points:reach max quota") {
      return "兑换失败，每人最多兑换" + item.max_num + "次"
    }
  }
  return "兑换失败!"
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  exchange: exchange,
}