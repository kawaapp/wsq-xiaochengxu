// pages/writer/writer.js
import api from '../../utils/api.js'
import util from'../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "",
    content: "",
  },
  bindTitle: function(e) {
    this.setData({title: e.detail.value})
  },
  bindContent: function(e) {
    this.setData({content: e.detail.value})
  },
  writerPublish: function() {
    api.createTopic({name: this.data.title, text: this.data.content}).then((resp)=> {
      // refresh list
      util.setResult(this)
      //
      if (resp.statusCode == 200) {
        wx.navigateBack({delta: 1})
      }
    }).catch((err)=>{
      // 发布失败
      console.log("write:", err)
    })
  },

  writerCancel: function() {
    wx.navigateBack({
      delta: 1
    })
  }
})