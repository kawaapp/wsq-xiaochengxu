const ctr = require('./controller.js')
const kawa = require('../../kawa.js')
const util = require('../../utils/util.js')

// pages/signin/signin.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: {
      images: kawa.Theme.Image,
      signColor: util.lightenColor(kawa.Theme.MainColor, 20),
    },
    user: {
    },
    sign: {
      days:[
      ],
      today: {
      },
    },
    exp: {
      sign: 1,
      seq: 2,
    },
    ranks: [
    ],
    loading: false,
    hasmore: true,
    pager: {
      index: 1,
      size: 20,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    ctr.setup(this)
    ctr.onLoad(options)
  },

  onUnload: function() {
    ctr.onUnload()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    ctr.onReachBottom()
  },

  clickSign: function() {
    ctr.onClickSign()
  }
})