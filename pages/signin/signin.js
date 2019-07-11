// pages/signin/signin.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {
      avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
      grade: 124,
    },
    sign: {
      title: '已连续签到3天',
      days:[{
        date: "07.11",
        value: 30,
        signed: true,
      },{
        date: "07.11",
        value: 30,
        signed: true,
      }, {
        date: "07.11",
        value: 30,
        signed: true,
      }, {
          date: "07.11",
          value: 40,
          signed: false,
      }, {
          date: "07.11",
          value: 40,
          signed: false,
      }, {
          date: "07.11",
          value: 40,
          signed: false,
      }, {
          date: "07.11",
          value: 40,
          signed: false,
      }
      ],
      signed: true,
    },
    ranks: [
      {
        avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        grade: 124,
        nickname: "小可爱",
        times: 120,
      },
      {
        avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        grade: 124,
        nickname: "小可爱",
        times: 120,
      },
      {
        avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        grade: 124,
        nickname: "小可爱",
        times: 120,
      },
      {
        avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        grade: 124,
        nickname: "小可爱",
        times: 120,
      },
      {
        avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        grade: 124,
        nickname: "小可爱",
        times: 120,
      }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})