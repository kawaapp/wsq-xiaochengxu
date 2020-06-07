// pages/enroll/join/join.js
Component({
  /* 组件的属性列表 */
  properties: {
    user_data: {
      type: Object,
      value: {},
    },
    show: {
      type: Boolean,
      value: false,
    }
  },

  /* 组件的初始数据 */
  data: {
    name: '',
    copr: '',
    phone: '',
    wxid: '',
  },

  /* 组件的方法列表 */
  methods: {
    clickClose: function() {
      this.triggerEvent('onRequestClose')
    },
    clickSubmit: function() {
      // validate
      var { user_data, name, corp, phone, wxid }= this.data
      if (user_data.name && !name) {
        wx.showToast({ title: '姓名没有填写哦', icon: 'none'},)
        return
      }
      if (user_data.corp && !corp) {
        wx.showToast({ title: '公司没有填写哦', icon: 'none'})
        return
      }
      if (user_data.phone && !phone) {
        wx.showToast({ title: '电话没有填写哦', icon: 'none'})
        return
      }
      if (user_data.wx && !wxid) {
        wx.showToast({ title: '微信没有填写哦', icon: 'none'})
        return
      }

      // submit
      this.triggerEvent('onSubmit', {name, corp, phone, wx: wxid})
    },

    // input bind
    inputName: function(e) {
      this.setData({name: e.detail.value })
    },
    inputCorp: function(e) {
      this.setData({corp: e.detail.value })
    },
    inputPhone: function(e) {
      this.setData({phone: e.detail.value })
    },
    inputWx: function(e) {
      this.setData({wxid: e.detail.value })
    }
  }
})
