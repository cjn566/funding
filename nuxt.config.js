
module.exports = {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    title: 'Keycard Student Access',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Keycard Student Access' }
    ]
  },
  // server: {
  //   port: 3001
  // },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    '@/assets/css/site.scss'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/vuelidate.js' },
    { src: '~/plugins/axios.js' }
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://bootstrap-vue.js.org
    'bootstrap-vue/nuxt',
    // Doc: https://axios.nuxtjs.org
    '@nuxtjs/axios',
    // Doc: https://auth.nuxtjs.org
    '@nuxtjs/auth-next'
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {},
  /*
  ** Auth module configuration
  ** See https://auth.nuxtjs.org
  */
  auth: {
    strategies: {
      local: {
        token: {
          property: 'token'
        },
        user: {
          autoFetch: false
        },
        endpoints: {
          login: { url: '/api/auth/login', method: 'post' },
          logout: false,
          user: false
        }
      }
    }
  },

  bootstrapVue: {
    bootstrapCSS: false,
    bootstrapVueCSS: false,
    icons: true
  },
  serverMiddleware: [
    '~/server/api-middleware.js'
  ],
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  },
  telemetry: false,
  router: {
    middleware: ['auth']
  }
}
