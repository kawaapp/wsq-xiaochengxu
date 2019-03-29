import api from '../../utils/api.js'
import util from '../../utils/util.js'

var view = undefined
function setup(v) {
  view = v
}

function onLoad(options) {

}

function onClickSubmit() {
  if (util.isWhiteSpace(view.data.content)) {
    return
  }

  var data = {
    title: view.data.title,
    content: view.data.content
  }

  api.createPost(data).then((resp) => {
    // refresh list
    util.setResult({
      req: 'newpost',
      ok: resp.statusCode == 200,
      data: resp.data
    })
    //
    if (resp.statusCode == 200) {
      wx.navigateBack({ delta: 1 })
    }
  }).catch((err) => {
    // 发布失败
    console.log("write:", err)
  })
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onClickSubmit: onClickSubmit,
}