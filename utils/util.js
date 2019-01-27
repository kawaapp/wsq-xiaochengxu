const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function setResult(data) {
  const pages = getCurrentPages();
  if (pages.length >= 2) {
    const prevPage = pages[pages.length - 2]  //上一个页面
    if (prevPage.onResult) {
      prevPage.onResult(data)
    }
  }
}

module.exports = {
  formatTime: formatTime,
  setResult: setResult
}
