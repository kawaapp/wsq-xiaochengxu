// pages/tmpl/adver/adunit.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: {
      type: String,
      value: '',
    },
    adid: {
      type: String,
      value: '',
    }
  },

  lifetimes: {
    attached: function () {
      if (this.data.type == 'inter') {
        showInterstitialAd(this)
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})

var interstitialAd = null
function showInterstitialAd(view) {
  if (wx.createInterstitialAd) {
    interstitialAd = wx.createInterstitialAd({
      adUnitId: view.data.adid
    })
  }

  console.log("create inersital ad..", interstitialAd)
  // 在适合的场景显示插屏广告
  if (interstitialAd) {
    interstitialAd.show().catch((err) => {
      console.error(err)
    })
  }
}