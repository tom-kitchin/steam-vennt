module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: "Vennt - compare your friends' steam libraries with venn diagrams",
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: "Pick the game night game easily with a venn diagram of your friends' steam games" },
      { name: 'format-detection', content: 'telephone=no' } // Block a stupid iOS Safari bug - see https://github.com/nuxt/nuxt.js/issues/130
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Global CSS
  */
  css: [
    'bootstrap/dist/css/bootstrap.min.css'
  ],
  /*
  ** Modules
  */
  modules: [
    ['@nuxtjs/google-analytics', { ua: 'UA-42470605-2' }],
  ],
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    // Mount libraries on build so multiple imports don't fatten the build.
    vendor: [
      'axios',
      'lodash',
      '~/assets/js/steam/client'
    ],
    /*
    ** Run ESLINT on save
    */
    extend (config, ctx) {
      if (ctx.dev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
