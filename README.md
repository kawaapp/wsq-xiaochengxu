# 卡哇微社区小程序
该社区小程序由 [卡哇微社区](http://kawaapp.com) 提供，拥有完整的社区功能。卡哇微社区是专业的微信小程序社区解决
方案，可以帮助客户快速的在微信内搭建自己的小程序社区。你可以通过如下小程序码预览：

<div align=center>
  <img width="720" src="https://kawaapp.com/static/ad.png"><img>
</div>

## 编译运行
小程序使用了卡哇微社区的社区API接口，如果运行该小程序需要在卡哇微社区后端注册用户，然后创建一个社区应用，
并配置微信小程序秘钥，相关配置参见：[卡哇微社区新手指南](https://mp.weixin.qq.com/s/3hsjr7ZKHlmbw-4HOhCM0A).

同时还应该在小程序中配置卡哇微社区 AppKey，为了方便测试，项目中已经内置了一个开发用 AppKey.
在项目目录下，找到 `kawa.js` 配置如下：
```
module.exports = {
  AppKey: "J3PDS76SH6JASQHX2QAY5VQ3QINXIYLEMVIREFADB7Z2BHCWC3VA====",
  Theme: theme_blue,
}
```

## 主题换肤
卡哇微社区小程序支持换肤功能，打开 `kawa.js` 文件，可以看到：
```
const theme_default = {
  Image: '/res/default',
  MainColor: '#20ACAB',
}

const theme_blue = {
  Image: '/res/blue',
  MainColor: '#1890ff',
}

module.exports = {
  AppKey: "J3PDS76SH6JASQHX2QAY5VQ3QINXIYLEMVIREFADB7Z2BHCWC3VA====",
  Theme: theme_blue,
}
```
此处已经内置了两套皮肤，如果需要添加皮肤，可以按照上面格式分别添加资源文件并配置主题色。

## 应用架构
卡哇微社区采用的是Model/View分离的应用架构，在每个页面下面会包含5个文件：
```
.
├── controller.js
├── home.js
├── home.json
├── home.wxml
├── home.wxss
└── tabdata.js
```
其中 `controller.js` 负责处理小程序的业务逻辑，`home.wxml/home.js` 负责处理视图逻辑。
为了让程序更加轻量、减少阅读难度同时便于维护，我们设计了这样的简化的MVC/MVP架构，你可以约
从这个架构继续开发，如果您的应用复杂度继续提升或许应该考虑别的架构。

## 协议条款
本程序是卡哇微社区贡献给开源社区的礼物，采用 MIT 协议发布。但是由于我们人力有限，所以并不提供
关于该小程序的任何技术支持和客服服务，请谅解。卡哇微社区是付费社区，如果您是付费用户，我们会
安排专属客服给您提供支持。

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
