import util from '../../utils/util.js'
import api from '../../utils/api.js'
const app = getApp()

// pages/poster/poster.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    painting: {},
    filePath: "",
    cursor: {},
    width: 375,
    height: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var meta = app.globalData.meta
    if (meta.app_qrcode) {
      startRending(this)
    } else {
      api.createQrCode().then(resp => {
        console.log("get qr code:", resp)
        meta.app_qrcode = resp.data
        startRending(this)
      }).catch(err => {
        console.log("get qrcode error:", err)
      })
    }

    wx.showLoading({
      title: '正在渲染..',
    })
  },  

  eventGetImage: function(e) {
    wx.hideLoading()
    console.log("get paiting:", e)
    if (e.detail.errMsg == 'canvasdrawer:ok') {
      this.setData({ filePath: e.detail.tempFilePath })
    } else {
      wx.showToast({
        title: '渲染失败', icon: 'none'
      })
    }
  },

  onSizeChanged: function(e) {
    console.log("get width, height:", e)
    this.setData({ width: e.detail.width, height: e.detail.height})
  },

  saveImage: function(e) {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.filePath,
      success(res) {
        wx.showToast({
          title: '保存成功',
        })
      },
      fail: function (res) {
        console.log(res);
      }
    })
  }
})

function startRending(view) {
  var p = util.getRequest("post")
  console.log("get post", p)
  view.setData({ painting: getDrawJson(view, p) })
}

function getDrawJson(view, p) {
  var meta = app.globalData.meta
  var { app_name = ''} = meta
  var json = {
    type: 'group',
    background: '#fff',
    width: 375,
    views: [
      {
        type: 'group',
        background: '#f8f8f8',
        width: 375,
        height: 50,
        views: [
          {
            type: 'text',
            content: app_name,
            fontSize: 22,
            color: '#666',
            textAlign: 'center',
            marginTop: 14,
            marginLeft: 187,
          }
        ]
      },
      {
        type: 'group',
        background: '#fff',
        width: 375,
        horizontal: true,
        views : [
          {
            type: 'image',
            url: (p.author && p.author.avatar) || '/res/circle_mask.png',
            width: 48,
            circle: true,
            marginLeft: 12,
            marginTop: 12,
          },
          {
            type: 'group',
            views: [
              {
                type: 'text',
                content: (p.author && p.author.nickname) || '',
                fontSize: 20,
                color: '#333',
                textAlign: 'left',
                marginTop: 12,
                marginLeft: 12,
              },
              {
                type: 'text',
                content: p.time,
                fontSize: 18,
                color: '#888',
                textAlign: 'left',
                marginTop: 8,
                marginLeft: 12,
              }
            ]
          },
        ]
      },
    ]
  }
  if (p.content) {
    json.views.push({
      type: 'text',
      content: p.content,
      fontSize: 22,
      breakWord: true,
      MaxLineNumber: 1000,
      width: 340,
      lineHeight: 28,
      color: '#333',
      textAlign: 'left',
      marginTop: 28,
      marginLeft: 12,
    })
  }

  if (p.images && p.images.length > 0) {
    json.views.push({
      type: 'image',
      url: p.images[0],
      marginTop: 30,
      marginLeft: 16,
      width: 340,
    })
  }

  // 渲染二维码
  json.views.push({
    type: 'group',
    background: '#f8f8f8',
    width: 375,
    marginTop: 40,
    views:[
      {
        type: 'image',
        url: meta.app_qrcode,
        marginLeft: 120,
        marginTop: 60,
        width: 128,
      },
      {
        type: 'text',
        content: '长按识别小程序码，查看社区讨论',
        fontSize: 17,
        color: '#888',
        textAlign: 'center',
        marginLeft: 187,
        marginTop: 14,
      }
    ]
  })
  return json
}