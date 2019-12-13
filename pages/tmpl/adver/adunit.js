const api = require('../../../utils/api.js')
const app = getApp()

// 所有广告埋点都是确定的情况下，可以把
// 所有逻辑归纳到这里。
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: {
      type: String,
      value: '',
    },
  },

  lifetimes: {
    attached: function () {
      setup(this)
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    indicator: true,
    autoplay: true,
    interval: 8000,
    banner_units: [],
    inters_units: {},
    inters_open: false,
    native: false,
    subtype: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickClose : function(e) {
      onClickClose(this) 
    },

    clickAd: function(e) {
      if (this.data.subtype == 'inters') {
        this.setData({ inters_open: false })
        jump(this.data.inters_units)
      } 
      if (this.data.subtype == 'banner') {
        const adunit = e.currentTarget.dataset.idx
        jump(adunit)
      }
    }
  }
})

function setup(view) {
  const type = view.data.type

  // 加载原生广告
  const wxad = app.globalData.wxad
  if (wxad && wxad[type+'_on']) {
    view.setData({ native: true, adid: wxad[type], subtype: subtypeMap[type] })
    return
  }

  // 加载自定义广告
  api.getAdunitList(type).then( resp => {
    const fn = setupFunc[type]
    fn && fn(view, resp.data)
  }).catch( err => {
    console.log("get ad err:", err)
  })
}

function setupInters(view, data) {
  if (!data || data.length == 0) {
    return
  }
  // get first
  view.setData({ inters_units: data[0], subtype: 'inters', inters_open: true})
}

function setupBanner(view, data) {
  if (!data || data.length == 0) {
    return
  }
  const units = data.slice(0, 5);
  view.setData({ banner_units: units, subtype: 'banner', indicator: units.length > 1 })
}

function onClickClose(view) {
  view.setData({ inters_open: false })
}

function jump(adunit) {
  try {
    const link = JSON.parse(adunit.link)
    if (!link.value) {
      return
    }
    if (link.type == 'mp') {
      wx.navigateToMiniProgram({
        appId: link.value,
      })
    } else {
      wx.navigateTo({
        url: '/pages/webview/webview?q=' + encodeURI(link.value),
      })
    }
  } catch(e) {}
}

const setupFunc = {
  "home_inters": setupInters,
  "home_banner": setupBanner,
  "home_feed": setupBanner,
  "detail_inters": setupInters,
  "detail_banner": setupBanner,
}

const subtypeMap = {
  "home_inters": 'inters',
  "home_banner": 'banner',
  "home_feed": 'banner',
  "detail_inters": 'inters',
  "detail_banner": 'banner',
}