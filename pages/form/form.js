const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

Page({

  /* 页面的初始数据 */
  data: {
    form: {
      title: "试试世界上最美的人?"
    },
    values: {},
    answered: false,
  },

  /* 生命周期函数--监听页面加载 */
  onLoad: function (options) {
    onLoad(this, options)
  },

  /* 用户点击右上角分享 */
  onShareAppMessage: function () {

  },

  clickForm: function() {
    if (this.data.answered) {
      wx.showToast({
        title: '已提交，不可再编辑啦!', icon: "none"
      })
    }    
  },

  clickSubmit: function() {
    var form = this.data.form
    var comps = this.selectAllComponents(".formitem")
    var data = comps.map( v => {
      return v.getResult()
    })
    var i = validate(form.form_items, data)
    if (i >= 0) {
      wx.showModal({
        title: `问题 ${i+1} 没有填写!`,
      })
      return
    }
    var values = data.map( (v, i) => {
      return {
        item_id: form.form_items[i].id,
        user_data: JSON.stringify(v) || '',
      }
    })
    var payload = {
      form_id: form.id,
      values: values,
    }
    doSubmit(this, payload)
  },
})

function onLoad(view, options) {
  api.autoAuth().then(() => {
    firtLoad(view, options.id || 3)
  })
}

function firtLoad(view, id) {
  wx.showLoading()
  api.getForm(id).then( resp => {
    console.log("get form:", resp.data)
    var form = resp.data
    var { form_items } = form
    form_items && form_items.map( item => {
      try {
        item.attrs = JSON.parse(item.attrs)
      } catch(e){}
    })
    form.expiredTime = util.prettyTime(new Date(form.expired_at*1000))
    form.count = (form_items || []).length
    view.setData({form})
    return api.getFormData(id)
  }).then( resp => {
    console.log("get answer:", resp)
    var data = resp.data
    var kv = {}
    data && data.map( a => {
      if (a.user_data) {
        try {
          kv[a.item_id] = JSON.parse(a.user_data)
        } catch(e){}
      }
    })
    var answered = Object.keys(kv).length > 0
    view.setData({ values: kv, answered: answered })
  }).catch( err => {
    console.log("get form err", err)
  }).finally( () => {
    wx.hideLoading()
  })
}

function validate(form_items, data) {
  var i = 0, n = data.length
  for (; i < n; i++) {
    if (!data[i] && form_items[i].attrs.required) {
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
    view.setData({ answered: true })
  }).catch( err => {
    console.log("form submit:", err)
    wx.showToast({
      title: '提交失败！', icon: "none"
    })
  })
}