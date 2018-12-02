import Vue from 'vue'
import axios from 'axios'

import App from './App'
import store from './store'
import VueTranslate from './vue-translate-plugin'
import Vuesax from 'vuesax'
import 'vuesax/dist/vuesax.css' //Vuesax styles
import 'material-icons/iconfont/material-icons.css'
// import './assets/fonts.css'
import 'vuex-toast/dist/vuex-toast.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(VueTranslate);
Vue.use(Vuesax);

/* eslint-disable no-new */
new Vue({
  components: { App },
  store,
  template: '<App/>'
}).$mount('#app')
