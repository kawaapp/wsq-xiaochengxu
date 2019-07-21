// pages/tmpl/location/location.js
const kawa = require('../../../kawa.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    location: {
      type: Object,
      value: "",
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    theme: kawa.Theme.Image,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickLocation: function(e) {
      var location = this.data.location
      if (location) {
        wx.openLocation({
          latitude: location.lat, longitude: location.lng, name: location.name,
        })
      }
    }
  }
})
