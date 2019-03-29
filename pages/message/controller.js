const api = require('../../utils/api.js')

var view = undefined
function setup(_view) {
  view = _view
}

function refreshMessage() {
  api.getMessageCount().then((resp) => {
    view.setData({ count: resp.data })
    console.log("get message count:", resp)
  }).catch(err => {
    console.log(err)
  })
}

module.exports = {
  setup: setup,
  refreshMessage: refreshMessage,
}