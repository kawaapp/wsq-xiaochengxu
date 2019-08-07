// pages/tmpl/fulltext/fulltext.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    text: {
      type: String,
      value: ''
    },
    limit: {
      type: Number,
      value: 70
    },
    selectable: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showList: [],
    showAll: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {

  },

  observers: {
    'text, limit': function (field) {
      var text = this.data.text, limit = this.data.limit
      var showAll = text.length > limit
      var showList = getShowList(text, limit)
      this.setData({ showList, showAll })
    },
  },
})

function getShowList(text, limit) {
  var show = text.length > limit? text.substring(0, limit): text
  return decorateText(show)
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
    styled.push({ tag: false, text: text })
  }
  return styled
}

function hashtag(text) {
  var regex = /#[^#]+#/g
  if (text) {
    return text.match(regex)
  }
  return null
}