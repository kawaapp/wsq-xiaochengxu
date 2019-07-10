// pages/list/list.js
const ctr = require('./controller.js')

/**
 * 聊天页面
 */
Page({

  /**
   * 页面的初始数据
   */
  data: {
    textMessage: '',
    chatItems: [
      {
        showTime: "2015年",
	      time: "2015-07-09",
        headUrl: "",
        isMy: true,
        content: "Hello",
	      type: 'text',
      },
      {
        showTime: "2015年",
        time: 0,
        headUrl: "",
        isMy: false,
        content: "Hello",
        type: 'text',
      }
    ],
    latestPlayVoicePath: '',
    isAndroid: true,
    chatStatue: 'open-f',
    chatStatusContent: '加载中...',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    ctr.setup(this)
    ctr.onLoad(options)
  },

  resetInputStatus() {
    chatInput.closeExtraView();
  },

  sendMsg({ content, itemIndex, success }) {
    this.imOperator.onSimulateSendMsg({
      content,
      success: (msg) => {
        this.UI.updateViewWhenSendSuccess(msg, itemIndex);
        success && success(msg);
      },
      fail: () => {
        this.UI.updateViewWhenSendFailed(itemIndex);
      }
    })
  },
  /**
   * 重发消息
   * @param e
   */
  resendMsgEvent(e) {
    const itemIndex = parseInt(e.currentTarget.dataset.resendIndex);
    const item = this.data.chatItems[itemIndex];
    this.UI.updateDataWhenStartSending(item, false, false);
    this.msgManager.resend({ ...item, itemIndex });
  },
});