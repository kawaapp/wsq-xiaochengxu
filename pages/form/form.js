const api = require('../../utils/api.js')
const biz = require('../../utils/biz.js')
const util = require('../../utils/util.js')

Page({

  /* 页面的初始数据 */
  data: {
    form: {
      title: "试试世界上最美的人?"
    },
    values: {},
    answered: false,
    expired: false,
  },

  /* 生命周期函数--监听页面加载 */
  onLoad: function (options) {
    onLoad(this, options)
  },

  /* 用户点击右上角分享 */
  onShareAppMessage: function () {
    api.logShare({ type: 'share-form' })
    // biz
    const { form } = this.data
    return {
      title: form.title,
      path: `/pages/form/form?shared=true&id=${form.id}`,
      imageUrl: form.poster,
    }
  },

  clickForm: function() {
    if (!biz.isUserHasName(this)) {
      return
    }
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
  // 模拟新用户的场景
  // if (options.shared) {
  //   try {
  //     wx.removeStorageSync('token')
  //   } catch (e) { }
  // }
  if (!options.shared) {
    firstLoad(view, options.id); return
  }

  // shared, login first
  api.autoAuth().then(() => {
    firstLoad(view, options.id)
  }).catch((err) => {
    if (biz.accessNotAllowed(err)) {
      wx.reLaunch({
        url: '/pages/login/login?man=true&private=true',
      })
      return
    }
    wx.showToast({
      title: '打开问卷失败:' + err.code, icon: 'none', duration: 2000,
    })
  })
}

function firstLoad(view, id) {
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
    var expired = false
    if(form.expired_at*1000 - new Date() < 0) {
      expired = true
    }
    view.setData({form, expired})
    return api.getFormData(id)
  }).then( resp => {
    wx.hideLoading()
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
    wx.hideLoading()
    console.log("get form err", err)
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