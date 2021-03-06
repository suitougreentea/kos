import * as Vue from 'vue'
import VueRouter from 'vue-router'

import { HomeComponent } from './components/home'

// register the plugin
Vue.use(VueRouter)

let router = new VueRouter({
  routes: [
    { path: '/', component: HomeComponent },
  ]
})


new Vue({
  el: '#app-main',
  router: router,
  components: {
  }
})
