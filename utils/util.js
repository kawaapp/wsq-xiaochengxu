const b64 = require('b64.js')

const formatTime = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()

  return [month, day].map(formatNumber).join('/') + ' ' + [hour, minute].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 从当前页面传递数据到上一个页面
function setResult(data) {
  const pages = getCurrentPages();
  if (pages.length >= 2) {
    const prevPage = pages[pages.length - 2]  //上一个页面
    if (prevPage.onResult) {
      prevPage.onResult(data)
    }
  }
}

// 从当前页面发送数据到目的页面，使用全局变量实现
// 需要用 getTransitData 方法提取
function setTransitData(key, value) {
  var g = getApp().globalData
  g.transit[key] = value
}

function getTransitData(key) {
  var g = getApp().globalData
  var v = g.transit[key]
  g.transit[key] = null
  return v
}

function jwtDecode(token) {
  var base64 = token.split('.')[1];
  var b = b64.atob(base64)
  return JSON.parse(b)
}

// check to see if the user token is expired or
// will expire within the next 30 minutes (1800 seconds).
// If not, there is nothing we really need to do here.
function jwtExpire(token, ahead) {
  if (!ahead) {
    ahead = 1800
  }
  if (Date.now()/1000 < jwtDecode(token).exp - ahead) {
    return false
  } 
  return true
}

// hashtag
function hashtag(text) {
  var regex = /#[^#]+#/g
  if (text) {
    return text.match(regex)
  }
  return null
}

// "123 #456# 789" => {{text:'123'}, {tag:true, text:'#456#'}, {text:'789'}}
function decorateText(text) {
  var styled = []
  var tags = hashtag(text)

  if (tags && tags.length > 0) {
    for (var i = 0; i < tags.length; i++) {
      var array = text.split(tags[i])
      if (array[0]) {
        styled.push({ tag: false, text: array[0] })
      }
      styled.push({ tag: true, text: tags[i] })
      text = array[1]
    }
  }
  if (text) {
    styled.push({ tag: false, text: text})
  }
  return styled
}

// Test white space
// Instead of checking the entire string to see if there's only whitespace, 
// just check to see if there's at least one character of non whitespace:
function isWhiteSpace(str) {
  return !/\S/.test(str)
}

// Parse json
function jsonParse(str) {
  var r = {}
  try {
    r.object = JSON.parse(str)
    r.ok = true
  } catch (e) {
    r.ok = false
  }
  return r
}

// update list item

module.exports = {
  formatTime: formatTime,
  setResult: setResult,
  sendRequest: setTransitData,
  getRequest: getTransitData,
  jwtDecode: jwtDecode,
  jwtExpire: jwtExpire,
  hashtag: hashtag,
  decorateText: decorateText,
  isWhiteSpace: isWhiteSpace,
  jsonParse: jsonParse,
}
