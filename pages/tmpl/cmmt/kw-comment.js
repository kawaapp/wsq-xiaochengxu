const kawa = require('../../../kawa.js')

Component({
  properties: {
    comments: {
      type: Number,
      value: 0,
    }
  },
  data: {
    theme: {
      images: kawa.Theme.Image,
    }
  },

  methods: {}
})
