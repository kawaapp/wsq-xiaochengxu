const api = require('api.js')

function getPhoneNumber(ecrypted, iv) {
  return new Promise((res, rej) => {
    wx.login({
      success: function (resp) {
        var data = {
          code: resp.code,
          data: ecrypted,
          iv: iv,
        }
        api.decrypt(data).then(resp => {
          res(resp.data)
        }).catch(err => {
          rej({code:2, err: err })
        })
      },
      fail: function (err) {
        rej({code: 1, err: err})
      }
    })
  })
}


function getGrade(grades, exp) {
  if (!grades || grades.length == 0) {
    return
  }
  grades.sort((a, b) => {
    return a.level > b.level
  })
  for (var i = 0; i < grades.length; i++) {
    if (grades[i].need_exp > exp) {
      return i
    }
  }
  return grades.length - 1
}

module.exports = {
  getPhoneNumber: getPhoneNumber,
  getGrade: getGrade,
}