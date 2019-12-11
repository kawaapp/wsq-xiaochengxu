import api from '../../utils/api.js'
import util from '../../utils/util.js'
import h2j from '../../utils/h2j/parser.js'

// pages/webview/webview.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    link: '',
    rich: true,
    title: '',
    nodes: {},
    author: '',
    date: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const link = decodeURI(options.q)
    if (link.startsWith("https://kawaapp.com")) {
      this.setData({ rich: true})
      getArticle(this, link)
    } else {
      this.setData({ rich: false})
      this.setData({ link: decodeURI(options.q) })
    }
  },
})

// eg: https://kawaapp.com/w/33G5ZCK7YUHO/articles/1517283126
function getArticle(view, link) {
  const appKey = link.substring(22, 34)
  const id = link.substring(44)
  api.getArticle(appKey, id).then( resp => {
    const data = resp.data
    const json = h2j.getRichTextJson(data.html)
    view.setData({ 
        rich: true,
        nodes: json.children, 
        title: data.title, 
        author: data.author,
      date: util.prettyTime(new Date(data.publish_at * 1000))
    })
  })
}