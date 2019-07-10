const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const chatInput = require("./comps/chat-input")

const app = getApp()

var view = undefined
function setup(_view) {
  view = _view
}

function onLoad(options) {
  initData();
}

function initData() {
  let that = view;
  let systemInfo = wx.getSystemInfoSync();
  chatInput.init(view, {
    systemInfo: systemInfo,
    sendButtonBgColor: 'mediumseagreen',
    sendButtonTextColor: 'white',
  });

  that.setData({
    pageHeight: systemInfo.windowHeight,
    isAndroid: systemInfo.system.indexOf("Android") !== -1,
  });

  // setup input event
  chatInput.setTextMessageListener((e) => {
    console.log("get input event:" + e.detail.value)
    
    sendMsg({ 
      showTime: "2015年",
      time: "2015-07-09",
      headUrl: "",
      isMy: true,
      content: e.detail.value,
      type: 'text',
    })
  });
}

// message manager
function showMsg(data) {
  view.data.chatItems.push(data)
  view.setData({
    chatItems: view.data.chatItems.sort(_sortMsgListByTimestamp),
    scrollTopVal: view.data.chatItems.length * 999,
  })
}

function sendMsg(data) {
  showMsg(data)
}

function _sortMsgListByTimestamp(item1, item2) {
  return item1.timestamp - item2.timestamp;
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
}