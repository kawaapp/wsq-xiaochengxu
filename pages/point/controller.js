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
}

function onUnload() {
  view = undefined
}

function exchange(target) {
  api.pointExchange(target.item.id).then( resp => {
    view.setData({ show: false, target: {}})
    wx.showToast({ title: '兑换成功！' })
  }).catch( err => {
    console.log(err)
    wx.showToast({ title: '兑换失败!', icon: 'none'})
  })
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  exchange: exchange,
}