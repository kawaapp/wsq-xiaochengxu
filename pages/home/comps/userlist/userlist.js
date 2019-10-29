const ctr = require('./controller.js')
const kawa = require('../../../../kawa.js')

// pages/home/comps/userlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  lifetimes: {
    attached: function () {
      ctr.setup(this)
      ctr.onLoad()
    },
  },

  // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
  attached: function () {
    ctr.setup(this)
    ctr.onLoad()
  },

  /**
   * 组件的初始数据
   */
  data: {
    theme: {
      images: kawa.Theme.Image,
    }, 
    loader: {
      ing: false,
      more: true,
    }, 
    users: [],
    page: 1,
    size: 20,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onPullDownRefresh: function () {
      ctr.onPullDownRefresh()
    },

    onReachBottom: function () {
      ctr.onReachBottom()
    },

    clickItem: function(e) {
      ctr.onClickItem(e)
    }
  }
})
