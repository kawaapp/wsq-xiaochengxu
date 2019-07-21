// pages/tmpl/img-grid/img-grid.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    fill: {
      type: Boolean,
      value: false,
    },
    images: {
      type: Object,
      value: [],
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    images: [
      "https://images.kawaapp.com/img_bjkk50cdbfdqfm68t540.jpg",
      //"https://images.kawaapp.com/img_bkbiucsdbfdqfm68targ.jpg",
      //"https://images.kawaapp.com/img_bkbiucsdbfdqfm68targ.jpg",

      // "https://images.kawaapp.com/img_bkbiucsdbfdqfm68targ.jpg",
      // "https://images.kawaapp.com/img_bkbiucsdbfdqfm68targ.jpg",
      // "https://images.kawaapp.com/img_bkbiucsdbfdqfm68targ.jpg",

      // "https://images.kawaapp.com/img_bkbiucsdbfdqfm68targ.jpg",
      // "https://images.kawaapp.com/img_bkbiucsdbfdqfm68targ.jpg",
      // "https://images.kawaapp.com/img_bkbiucsdbfdqfm68targ.jpg"
    ],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickImage: function(e) {
      onClickImage(this, e)
    },
  }
})

function onClickImage(view, e) {
  var index = e.target.dataset.idx
  var images = view.data.images
  wx.previewImage({
    urls: images,
    current: images[index],
  })
}
