const kawa = require('../../../kawa.js')

// pages/tmpl/like/kw-like.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    favored: {
      type: Number,
      value: 0,
    },
    favors: {
      type: Number,
      value: 0,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    theme: {
      images: kawa.Theme.Image,
      favorColor: kawa.Theme.FavorColor || kawa.Theme.MainColor,
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
  }
})
