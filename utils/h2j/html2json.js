const discode = require('./discode')
const htmlParser = require('./htmlparser')

const __placeImgeUrlHttps = 'https'
var customTag = {}

function removeDoctype(html) {
    return html.replace(/<\?xml.*\?>\n/, '').replace(/<.*!doctype.*\n/, '').replace(/<.*!DOCTYPE.*\n/, '')
}

function trimHtml(html) {
    return html.replace(/\r?\n+/g, '').replace(/<!--.*?-->/ig, '').replace(/\/\*.*?\*\//ig, '').replace(/[ ]+</ig, '<')
}

function definedCustomTag(options) {
    customTag = options
}

function getHtmlJson(html) {
    html = removeDoctype(html)
    html = trimHtml(html)
    html = discode.strDiscode(html)

    let bufArray = []
    let results = {
      children: []
    }

    htmlParser(html, {
      start: function (tag, attrs, unary) {
        let node = {
          name: tag
        }

        if (attrs.length !== 0) {
          node.attrs = attrs.reduce(function (pre, attr) {
            const name = attr.name
            const value = attr.value
            if (pre[name]) {
              if (Array.isArray(pre[name])) {
                pre[name].push(value)
              } else {
                pre[name] = [pre[name], value]
              }
            } else {
              pre[name] = value
            }
            return pre
          }, {})
        }

        node.attrs = Object.assign({}, node.attrs)
        const hasClass = node.attrs.hasOwnProperty('class')
        node.attrs.class = hasClass ? node.attrs.class + ' rich-' + node.name : 'rich-' + node.name

        if (node.name === 'img') {
          let imgUrl = node.attrs.src
          if (imgUrl[0] === '') {
            imgUrl.splice(0, 1)
          }
          imgUrl = discode.urlToHttpUrl(imgUrl, __placeImgeUrlHttps)
          node.attrs.src = imgUrl
        }

        if (node.name === 'source') {
          results.source = node.attrs.src
        }

        if (unary) {
          let parent = bufArray[0] || results
          if (parent.children === undefined) {
            parent.children = []
          }
          parent.children.push(node)
        } else {
          bufArray.unshift(node)
        }
      },
      end: function (tag) {
        let node = bufArray.shift()
        if (node.name !== tag) console.error('invalid state: mismatch end tag')

        if (node.name === 'video' && results.source) {
          node.attrs.src = results.source
          delete results.source
        }

        if (customTag.hasOwnProperty(node.name)) {
          node.name = customTag[node.name]
        }

        if (bufArray.length === 0) {
          results.children.push(node)
        } else {
          let parent = bufArray[0]
          if (parent.children === undefined) {
            parent.children = []
          }
          parent.children.push(node)
        }
      },
      chars: function (text) {
        let node = {
          text: text,
          type: 'text'
        }

        if (bufArray.length === 0) {
          results.children.push(node)
        } else {
          var parent = bufArray[0]
          if (parent.children === undefined) {
            parent.children = []
          }
          parent.children.push(node)
        }
      },
      comment: function (text) { }
    })

    return results
}

module.exports = {
  getHtmlJson: getHtmlJson,
  definedCustomTag: definedCustomTag
}