// pages/writer/writer.js
const ctr = require('./controller.js')
const kawa = require('../../kawa.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: {
      images: kawa.Theme.Image,
      color: kawa.Theme.MainColor,
      tabColor: kawa.Theme.TabSelectedColor || kawa.Theme.MainColor,
    },    
    title: "",
    content: "",
    location: "",
    images: [],
    video:{},
    topic: {
      items: [],
      selected: -1,
    },
    showAdd: false,
  },
  onLoad(options) {
    ctr.setup(this)
    ctr.onLoad(options)
  },
  onUnload: function () {
    ctr.onUnload()
  },

  bindTitle: function(e) {
    this.setData({title: e.detail.value})
  },
  bindContent: function(e) {
    this.setData({content: e.detail.value})
  },
  writerPublish: function() {
    ctr.onClickSubmit()
  },
  chooseMedia: ctr.onChooseMedia,
  clickVideo: ctr.onClickVideo,
  chooseImage: ctr.onChooseImage,
  clickImage: ctr.onClickImage,
  clickDelete: ctr.onDeleteImage,
  clickDeleteVideo: ctr.onClickDeleteVideo,
  writerCancel: function() {
    wx.navigateBack({
      delta: 1
    })
  },
  clickTag: function(e) {
    ctr.onClickTag(e)
  }, 
  clickLocation: function(e) {
    ctr.onClickLocation(e)
  },
  clickDeleteLocation: function(e) {
    ctr.onDeleteLocation(e)
  }
})