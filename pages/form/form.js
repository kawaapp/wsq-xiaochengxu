const api = require('../../utils/api.js')

Page({

  /* 页面的初始数据 */
  data: {
    form: {
      title: "试试世界上最美的人?"
    }
  },

  /* 生命周期函数--监听页面加载 */
  onLoad: function (options) {
    onLoad(this, options)
  },

  /* 用户点击右上角分享 */
  onShareAppMessage: function () {

  },

  clickSubmit: function() {
    var form = this.data.form
    var comps = this.selectAllComponents(".formitem")
    var data = comps.map( v => {
      return v.getResult()
    })
    var i = validate(form.options, data)
    if (i >= 0) {
      wx.showModal({
        title: `问题 ${i+1} 没有填写!`,
      })
      return
    }
    var values = data.map( (v, i) => {
      return {
        item_id: form.options[i].id,
        user_data: JSON.stringify(v) || '',
      }
    })
    var payload = {
      form_id: form.id,
      options: values,
    }
    doSubmit(this, payload)
  },
})

function onLoad(view, options) {
  var setup = function() {
    api.getForm(options.id || 2).then( resp => {
      const options = resp.data.options
      if (options) {
        options.map( item => {
          try {
            item.attrs = JSON.parse(item.attrs)
          } catch(e){}
        })
      }
      view.setData({form: resp.data})
      console.log("get form:", resp.data)
    }).catch( err => {
      console.log("get form err", err)
    })
  }
  api.autoAuth().then(() => {
    setup()
  })
}

function validate(options, data) {
  var i = 0, n = data.length
  for (; i < n; i++) {
    if (!data[i] && options[i].attrs.required) {
      return i
    }
  }
  return -1
}

function doSubmit(view, data) {
  api.formSubmit(data).then( resp => {
    wx.showToast({
      title: '提交成功！',
    })
  }).catch( err => {
    console.log("form submit:", err)
    wx.showToast({
      title: '提交失败！', icon: "none"
    })
  })
}