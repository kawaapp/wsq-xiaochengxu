import api from '../../utils/api.js'
import util from '../../utils/util.js'
const app = getApp()

var view = undefined
function setup(v) {
  view = v
}

function onLoad(options) {
  var topic = app.globalData.topics
  view.setData({ topic: { items: topic, selected: -1}})
}

function refreshTopics() {

}

function onClickImage(e) {
  var index = e.target.dataset.index
  var images = view.data.images
  wx.previewImage({
    urls: images,
    current: images[index],
  })
}

function onDeleteImage(e) {
  var index = e.target.dataset.index
  var images = view.data.images
  images.splice(index, 1)
  view.setData({images: images})
}

function onChooseImage(e) {
  var left = 9 - view.data.images.length
  wx.chooseImage({
    count: left,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: function(res) {
      if (res.tempFilePaths.length > 0) {
        addNewImage(res.tempFilePaths)
      }
    },
  })
}

function addNewImage(images) {
  var array = view.data.images
  array = array.concat(images)
  view.setData({images: array})
}

function onClickSubmit() {
  if (util.isWhiteSpace(view.data.content) && (view.data.images.length == 0)) {
    return
  }

  var data = {
    title: view.data.title,
    content: view.data.content
  }

  // attach topic
  var topic = view.data.topic
  if (topic.selected >= 0 && topic.selected < topic.items.length) {
    data.content = '#' + topic.items[topic.selected] + '#' + data.content
  }

  var handler = undefined
  if (view.data.images.length > 0) {
    handler = uploadImages(data, view.data.images)
  } else {
    handler = uploadText(data)
  }

  // handle result
  wx.showLoading({
    title: '正在发送...',
  })
  handler.then((resp) => {
    // refresh list
    util.setResult({
      req: 'newpost',
      ok: resp.statusCode == 200,
      data: resp.data
    })
    //
    if (resp.statusCode == 200) {
      wx.navigateBack({ delta: 1 })
    }
  }).catch((err) => {
    // 发布失败
    console.log("write:", err)
    wx.hideLoading()
    wx.showToast({
      title: '发送失败', icon: 'none'
    })
  })
}

function uploadText(data) {
  return api.createPost(data)
}

function uploadImages(data, images) {
  return new Promise((res, rej) => {
    var array = []
    for (var i = 0; i < images.length; i++) {
      array.push(uploadFile(images[i]))
    }
    Promise.all(array).then(results => {
      var path = JSON.stringify(results)
      data.media = {
        path: path,
        type: 1,  // 1: image 2: audio 3: video
      }
      api.createPost(data).then((resp) => {
        res(resp)
      }).catch(err => {
        rej(err)
      })
    }).catch(err => {
      rej(err)
    })
  })
}

// 貌似多图片上传很麻烦而且很容易出错...
function uploadFile(file) {
  return new Promise((res, rej) => {
    wx.uploadFile({
      url: 'https://kawaapp.com/x/api/images',
      filePath: file,
      name: 'file',
      success: function (resp) {
        if (resp.statusCode == 200) {
          res(resp.data)
        } else {
          rej({ code: resp.statusCode, msg: resp.data})
        }
      },
      fail: function (resp) {
        rej({ code: -1, msg: resp})
      }
    })
  })
}


function onClickTag(e) {
  var idx = e.target.dataset.idx;
  var topic = view.data.topic
  if (topic.selected == idx) {
    topic.selected = -1
  } else {
    topic.selected = idx
  }
  view.setData({ topic: topic })
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onClickImage: onClickImage,
  onDeleteImage: onDeleteImage,
  onChooseImage: onChooseImage,
  onClickSubmit: onClickSubmit,
  onClickTag: onClickTag,
}