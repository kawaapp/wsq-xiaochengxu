const util = require('../../../utils/util.js')

let _page;
let inputObj = {};
let tabbarHeigth = 0, extraButtonClickEvent;

// let isRecordAuth = false;

function init(page, opt) {
    if (!isNaN(opt.tabbarHeigth)) {
        tabbarHeigth = opt.tabbarHeigth;
    }
    _page = page;
    initData(opt);
}

function initData(opt) {
    _page.data.inputObj = inputObj = {
        voiceObj: {},
    };
}

function setTextMessageListener(cb) {
    if (_page) {
        _page.chatInputBindFocusEvent = function () {
            _page.setData({
                'inputObj.inputType': 'text'

            })
        };
        _page.chatInputBindBlurEvent = function () {
            setTimeout(() => {
                let obj = {};
                if (!inputObj.inputValueEventTemp || !inputObj.inputValueEventTemp.detail.value) {
                    inputObj.inputValueEventTemp = null;
                    obj['inputObj.inputType'] = 'none';
                }
                obj['inputObj.extraObj.chatInputShowExtra'] = false;
                _page.setData(obj);
            });
        };
        _page.chatInputSendTextMessage = function (e) {
            _page.setData({
                textMessage: ''
            });
            typeof cb === "function" && cb(e);
            inputObj.inputValueEventTemp = null;
        };
        _page.chatInputSendTextMessage02 = function () {
            if (!!inputObj.inputValueEventTemp && !!inputObj.inputValueEventTemp.detail.value) {
                typeof cb === "function" && cb(JSON.parse(JSON.stringify(inputObj.inputValueEventTemp)));
            }

            _page.setData({
                textMessage: '',
                'inputObj.inputType': 'none'
            });
            inputObj.inputValueEventTemp = null;

        }
        _page.chatInputGetValueEvent = function (e) {
            inputObj.inputValueEventTemp = e;
            _page.setData({
                textMessage: e.detail.value
            })
          if (!util.isWhiteSpace(e.detail.value) && !_page.data.reply.enable) {
            _page.setData({
              reply: {enable: true}
            })
          } 
          
          if (util.isWhiteSpace(e.detail.value) && _page.data.reply.enable) {
            _page.setData({
              reply: { enable: false }
            })
          }
        }
    }
}

module.exports = {
    init: init,
    setTextMessageListener: setTextMessageListener,
};
