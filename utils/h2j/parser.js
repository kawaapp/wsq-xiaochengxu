// 感谢：
// https://github.com/Chaunjie/rich-text-parser
const ParseJson = require('./html2json')

function  getRichTextJson(html) {
  return ParseJson.getHtmlJson(html)
}

function  definedCustomTag(options) {
    const newOptions = {}
    for (let i in options) {
      newOptions[i] = options[i] ? options[i] : 'div'
    }
  ParseJson.definedCustomTag(newOptions)
}

// define custom tag
definedCustomTag({ figure: 'div', figcaption: '' })

module.exports = {
  getRichTextJson: getRichTextJson,
  definedCustomTag: definedCustomTag
}