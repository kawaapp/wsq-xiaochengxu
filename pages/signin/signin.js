const ctr = require('./controller.js')

// pages/signin/signin.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {
    },
    sign: {
      title: '已连续签到3天',
      // {
      //   date: "07.11",
      //   value: 30,
      //   signed: true,
      // }
      days:[
      ],
      signed: true,
    },
    // {
    //   avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    //   grade: 124,
    //   nickname: "小可爱",
    //   times: 120,
    // }
    ranks: [
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    ctr.setup(this)
    ctr.onLoad(options)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  
})