import api from '../../utils/api.js'
import util from '../../utils/util.js'
const app = getApp()

var view = undefined
function setup(v) {
  view = v
}

function onUnload() {
  view = undefined
}

function onLoad(options) {
  var topic = app.globalData.topics
  view.setData({ topic: { items: topic, selected: -1}})
}

function refreshTopics() {

}

function onClickImage(e) {
  var index = e.currentTarget.dataset.idx
  var images = view.data.images
  wx.previewImage({
    urls: images,
    current: images[index],
  })
}

function onDeleteImage(e) {
  var index = e.currentTarget.dataset.idx
  var images = view.data.images
  images.splice(index, 1)
  view.setData({images: images})
}

function videoSupport() {
  if (app.globalData.meta && app.globalData.meta.app_video) {
    return true
  }
  return false
}

function onChooseMedia() {
  if (!videoSupport()) {
    onChooseImage()
    return
  }

  var menu = {
    items: ["照片", "视频"],
    actions: [onChooseImage, onChooseVideo],
  }
  wx.showActionSheet({
    itemList: menu.items,
    success: function (res) {
      var fn = menu.actions[res.tapIndex]
      fn()
    },
    fail: function (res) {
      console.log(res.errMsg)
    }
  })
}

function onClickVideo() {
  console.log("click video..")
}

function onChooseVideo() {
  wx.chooseVideo({
    sourceType: ['album', 'camera'],
    maxDuration: 60,
    camera: 'back',
    success(res) {
      res.src = res.tempFilePath
      res.cover = res.thumbTempFilePath
      console.log("get cover:",res)
      view.setData({ video: res })
    }
  })
}

function onClickDeleteVideo() {
  view.setData({video: {}})
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

function hasContent() {
  if (!util.isWhiteSpace(view.data.content)) {
    return true
  }
  if (view.data.images.length > 0) {
    return true
  }
  if (view.data.video.src) {
    return true
  }
  return false
}

function onClickSubmit() {
  if (!hasContent()) {
    return
  }

  // 文本内容
  var data = {
    title: view.data.title,
    content: view.data.content
  }

  // 地理位置
  if (view.data.location) {
    data.location = JSON.stringify(view.data.location)
  }

  // attach topic
  var topic = view.data.topic
  var tag = undefined
  if (topic.selected >= 0 && topic.selected < topic.items.length) {
    tag = topic.items[topic.selected].text
    data.content = '#' + tag + '# ' + data.content
  }

  var handler = undefined
  if (view.data.images.length > 0) {
    handler = uploadImages(data, view.data.images)
  } else if (view.data.video.src) {
    handler = uploadVideo(data, view.data.video)
  } else {
    handler = uploadText(data)
  }

  // handle result
  wx.showLoading({
    title: '正在发送...',
  })
  handler.then((resp) => {
    wx.hideLoading()

    // 关联标签和文章
    if (tag) {
      linkTagPost(tag, resp.data.id)
    }

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

    // tips
    if (resp.data && resp.data.status) {
      var audit = ((resp.data.status >> 3) & 1) != 0
      if (audit) {
        console.log("show toast...")
        setTimeout(function () {
          wx.showToast({
            title: '已发布等待审核', icon: 'none'
          })
        }, 1000);
      }
    }
  }).catch((err) => {
    // 发布失败
    console.log("write:", err)
    wx.hideLoading()
    wx.showToast({
      title: '发送失败:'+err.code, icon: 'none'
    })
  })
}

function linkTagPost(tag, pid) {
  api.linkTagPost({tags:[tag], pid: pid}).then( resp => {
    console.log("link success:" + resp.statusCode)
  }).catch( err => {
    console.log(err)
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

// 上传视频
function uploadVideo(data, video) {
  var handler = new Promise((res, rej) => {
    wx.uploadFile({
      url: 'https://kawaapp.com/x/api/videos',
      filePath: video.src,
      name: 'file',
      success: function (resp) {
        if (resp.statusCode == 200) {
          res(resp.data)
        } else {
          rej({ code: resp.statusCode, msg: resp.data })
        }
      },
      fail: function (resp) {
        rej({ code: -1, msg: resp })
      }
    })
  })
  return new Promise((res, rej) => {
    handler.then(video => {
      data.media = {
        path: video, type: 3,  // 1: image 2: audio 3: video
      }
      api.createPost(data).then((resp) => {
        res(resp)
      }).catch(err => {
        rej(err)
      })
    }).catch( err => {
      rej(err)
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

function onClickLocation(e) {
  wx.chooseLocation({
    success: function(res) {
      var showname = res.name
      var city = util.getCityName(res.address)
      if (city) {
        showname = city + '·' + res.name
      }
      var location = {
        name: showname,
        address: res.address,
        lat: res.latitude,
        lng: res.longitude,
      }
      view.setData({ location: location})
    },
  })
}

function onDeleteLocation(e) {
  console.log("delete location...")
  view.setData({location: {}})
}

module.exports = {
  setup: setup,
  onLoad: onLoad,
  onUnload: onUnload,
  onClickImage: onClickImage,
  onDeleteImage: onDeleteImage,
  onChooseMedia: onChooseMedia,
  onClickVideo: onClickVideo,
  onClickDeleteVideo: onClickDeleteVideo,
  onChooseImage: onChooseImage,
  onClickSubmit: onClickSubmit,
  onClickTag: onClickTag,
  onClickLocation: onClickLocation,
  onDeleteLocation: onDeleteLocation,
}