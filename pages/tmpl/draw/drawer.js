const ctr = require('./controller.js')

Component({
  properties: {
    painting: {
      type: Object,
      value: {view: []},
      observer (newVal, oldVal) {
        if (!this.data.isPainting) {
          if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
            if (newVal && newVal.width) {
              this.setData({
                showCanvas: true,
                isPainting: true
              })
              this.readyPigment()
            }
          } else {
            if (newVal && newVal.mode !== 'same') {
              this.triggerEvent('getImage', {errMsg: 'canvasdrawer:samme params'})
            }
          }
        }
      }
    }
  },
  data: {
    showCanvas: false,

    width: 375,
    height: 650,

    tempFileList: [],

    isPainting: false
  },
  ctx: null,
  cache: {},
  ready () {
    this.ctx = wx.createCanvasContext('canvasdrawer', this)
  },

  lifetimes: {
    attached: function () {
      ctr.setup(this)
    },
  },

  attached: function () {
    ctr.setup(this)
  },

  methods: {
    readyPigment () {
      const inter = setInterval(() => {
        if (this.ctx) {
          clearInterval(inter)
          this.ctx.clearActions()
          this.ctx.save()
          ctr.start()
        }
      }, 100)
    },

    sizeChanged(width, height) {
      this.triggerEvent('sizeChanged', { width: width, height: height})
    }
  }
})